import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { prisma } from '@/lib/prisma'

type BlogPostPageProps = {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  })

  if (!post || !post.published) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white px-6 py-16 md:px-12 lg:px-20">
      <article className="mx-auto max-w-3xl space-y-8">
        <Link href="/blog" className="text-sm text-gray-600 underline hover:text-gray-800">
          Back to blog
        </Link>

        <header className="space-y-3">
          <p className="text-sm text-gray-500">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}
          </p>
          <h1 className="text-4xl font-bold text-black">{post.title}</h1>
          <p className="text-lg text-gray-600">{post.excerpt}</p>
          {post.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={`${post.slug}-${tag}`} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <div className="max-w-none text-gray-900 [&_a]:text-blue-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-2xl [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-gray-900 [&_pre]:p-3 [&_pre]:text-gray-100 [&_ul]:list-disc [&_ul]:pl-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </article>
    </main>
  )
}
