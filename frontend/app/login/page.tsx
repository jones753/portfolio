import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { LoginForm } from '@/components/auth/login-form'

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth()
  if (session?.user) {
    redirect('/dashboard')
  }

  const params = await searchParams

  return (
    <main className="min-h-screen bg-white px-6 py-16 md:px-12">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-gray-200 p-8">
        <Link href="/" className="text-sm text-gray-600 underline hover:text-gray-800">
          Back to portfolio
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-black">Dashboard login</h1>
          <p className="text-sm text-gray-600">Sign in to manage blog content.</p>
        </div>
        <LoginForm callbackUrl={params.callbackUrl} />
      </div>
    </main>
  )
}
