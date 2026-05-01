import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { mapBlogPost } from '@/lib/blog-server'

const updateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(2),
  excerpt: z.string().min(10),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
})

type RouteProps = {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteProps) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? 'Invalid payload.'
    return NextResponse.json({ error: firstIssue }, { status: 400 })
  }

  const currentPost = await prisma.blogPost.findUnique({
    where: { id },
  })

  if (!currentPost) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  }

  const shouldSetPublishedDate = parsed.data.published && !currentPost.published

  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        slug: parsed.data.slug?.trim() || currentPost.slug,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        tags: parsed.data.tags,
        published: parsed.data.published,
        publishedAt: shouldSetPublishedDate
          ? new Date()
          : parsed.data.published
            ? currentPost.publishedAt
            : null,
      },
    })

    return NextResponse.json({ post: mapBlogPost(post) })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists. Pick another slug.' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Could not update post.' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not delete post.' }, { status: 500 })
  }
}
