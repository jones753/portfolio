'use server'

import { AuthError } from 'next-auth'
import { signIn } from '@/auth'

export async function loginWithCredentials(
  _previousState: string | undefined,
  formData: FormData,
) {
  const email = formData.get('email')
  const password = formData.get('password')
  const callbackUrl = formData.get('callbackUrl')

  if (typeof email !== 'string' || typeof password !== 'string') {
    return 'Invalid login form.'
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: typeof callbackUrl === 'string' && callbackUrl.length > 0 ? callbackUrl : '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return 'Invalid email or password.'
    }
    throw error
  }

  return undefined
}
