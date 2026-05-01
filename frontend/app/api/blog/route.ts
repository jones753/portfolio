import { NextResponse } from 'next/server'
import { getPublishedPosts } from '@/lib/blog-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limitRaw = searchParams.get('limit')

  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined
  const validLimit = Number.isFinite(limit) && (limit ?? 0) > 0 ? limit : undefined

  const posts = await getPublishedPosts(validLimit)
  return NextResponse.json({ posts })
}
