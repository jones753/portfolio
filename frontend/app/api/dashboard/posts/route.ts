import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { mapBlogPost } from '@/lib/blog-server'

const createSchema = z.object({
  title: z.string().min(2),
  excerpt: z.string().min(10),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
})

function slugify(value: string) {
  const sanitized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  return sanitized || 'post'
}

async function createUniqueSlug(baseTitle: string) {
  const baseSlug = slugify(baseTitle)
  let candidate = baseSlug
  let suffix = 1

  while (true) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: candidate } })
    if (!existing) {
      return candidate
    }

    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ posts: posts.map(mapBlogPost) })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? 'Invalid payload.'
    return NextResponse.json({ error: firstIssue }, { status: 400 })
  }

  const slug = await createUniqueSlug(parsed.data.title)

  try {
    const post = await prisma.blogPost.create({
      data: {
        slug,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        tags: parsed.data.tags,
        published: parsed.data.published,
        publishedAt: parsed.data.published ? new Date() : null,
      },
    })

    return NextResponse.json({ post: mapBlogPost(post) }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists. Use another title.' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Could not create post.' }, { status: 500 })
  }
}
