export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  publishedAt: string | null
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
}
