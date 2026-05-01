import { prisma } from '@/lib/prisma'
import type { BlogPost } from '@/lib/blog'

function toIsoString(date: Date | null) {
  return date ? date.toISOString() : null
}

export function mapBlogPost(post: {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  tags: string[]
  published: boolean
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    tags: post.tags,
    published: post.published,
    publishedAt: toIsoString(post.publishedAt),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }
}

export async function getPublishedPosts(limit?: number) {
  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: limit,
  })

  return posts.map(mapBlogPost)
}
