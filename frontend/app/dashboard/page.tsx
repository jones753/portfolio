import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { mapBlogPost } from '@/lib/blog-server'
import { BlogEditor } from '@/components/dashboard/blog-editor'
import { logout } from '@/app/dashboard/actions'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return (
    <main className="min-h-screen bg-white px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black">Blog CMS dashboard</h1>
            <p className="text-sm text-gray-600">Create, edit, and publish your markdown posts.</p>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Sign out
            </button>
          </form>
        </div>

        <BlogEditor initialPosts={posts.map(mapBlogPost)} />
      </div>
    </main>
  )
}
