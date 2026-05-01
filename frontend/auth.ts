import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compare, hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials)
        if (!parsed.success) {
          return null
        }

        let user = await prisma.user.findUnique({
          where: {
            email: parsed.data.email,
          },
        })

        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        if (
          !user &&
          adminEmail &&
          adminPassword &&
          parsed.data.email === adminEmail &&
          parsed.data.password === adminPassword
        ) {
          const hashedPassword = await hash(adminPassword, 10)
          user = await prisma.user.create({
            data: {
              email: adminEmail,
              name: 'Admin',
              hashedPassword,
            },
          })
        }

        if (!user?.hashedPassword) {
          return null
        }

        const validPassword = await compare(parsed.data.password, user.hashedPassword)
        if (!validPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
})
