'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { loginWithCredentials } from '@/app/login/actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  )
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, formAction] = useActionState(loginWithCredentials, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? '/dashboard'} />

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <SubmitButton />
    </form>
  )
}
