import Link from 'next/link'
import { blogPosts } from '@/lib/blog'

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white px-6 md:px-12 lg:px-20 py-16 md:py-20">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="space-y-4">
          <Link href="/" className="text-sm md:text-base text-gray-600 underline hover:text-gray-800">
            Back to portfolio
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black">Blog</h1>
        </div>

        <div className="space-y-6">
          {blogPosts.length === 0 ? (
            <div className="p-8 md:p-10 bg-gray-50 rounded-2xl space-y-3">
              <p className="text-sm uppercase tracking-wider text-gray-500">Coming soon</p>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl">
                New posts are on the way. Check back soon.
              </p>
            </div>
          ) : (
            blogPosts.map((post) => (
              <article key={post.slug} className="p-6 md:p-8 bg-gray-50 rounded-2xl space-y-4">
                <p className="text-sm text-gray-500">{new Date(post.publishedAt).toLocaleDateString()}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-black">{post.title}</h2>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={`${post.slug}-${tag}`}
                      className="px-3 py-1 rounded-full bg-white text-gray-700 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
