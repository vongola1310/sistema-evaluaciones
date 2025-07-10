import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import type { AuthOptions, NextAuthOptions } from "next-auth"
import bcrypt from 'bcryptjs'

// Extiende los tipos de NextAuth para incluir 'role' en el usuario de sesión
import NextAuth from "next-auth"



declare module "next-auth" {
   interface User {
    id: string
    role: string // Cambia a string sin null si siempre tendrá valor
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string | null
    }
  }
}



export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Correo y contraseña son requeridos')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) throw new Error('Usuario no encontrado')

        const validPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!validPassword) throw new Error('Contraseña incorrecta')

        return user
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },

callbacks: {
  async jwt({ token, user }) {
    // Esto se ejecuta cuando se genera el JWT
    if (user) {
     token.role = (user as any).role
     token.id = (user as any).id
    }
    return token
  },
  async session({ session, token }) {
    // Esto se ejecuta cuando se crea la sesión en el cliente
    if (session.user && token) {
      session.user.role = token.role as string
      session.user.id = token.id as string
    }
    return session
  },
}

}

