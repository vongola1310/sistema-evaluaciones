import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import type { AuthOptions } from "next-auth"
import bcrypt from 'bcryptjs'
import type { JWT } from "next-auth/jwt"

// Tipos extendidos (sin cambios)
declare module "next-auth" {
  interface User { role: string }
  interface Session {
    user: {
      id: string; name?: string | null; email?: string | null; image?: string | null;
      role?: string | null; employeeId?: number | null;
    }
  }
}
declare module "next-auth/jwt" {
  interface JWT { role?: string | null; employeeId?: number | null }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
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
        
        // ✅ LOG 1: Ver qué usuario se encontró en la BD
        console.log("--- PASO 1: AUTHORIZE ---");
        console.log("Usuario encontrado en la base de datos:", user);

        if (!user) throw new Error('Usuario no encontrado')
        
        const validPassword = await bcrypt.compare(credentials.password, user.password)
        if (!validPassword) throw new Error('Contraseña incorrecta')
        
        return user
      },
    }),
  ],
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      // 'user' solo está disponible en el primer inicio de sesión
      if (user) {
        // ✅ LOG 2: Ver el objeto 'user' que llega al callback JWT
        console.log("--- PASO 2: CALLBACK JWT (Inicio de sesión) ---");
        console.log("Objeto 'user' recibido:", user);
        
        token.id = user.id
        token.role = user.role
        
        if (user.role === 'employee') {
          const employeeProfile = await prisma.employee.findUnique({
            where: { userId: user.id },
            select: { id: true },
          });

          // ✅ LOG 3: Ver si se encontró un perfil de empleado
          console.log("Perfil de empleado encontrado:", employeeProfile);

          if (employeeProfile) {
            token.employeeId = employeeProfile.id;
          }
        }
      }
      // ✅ LOG 4: Ver el token final antes de ser guardado
      console.log("Token JWT final:", token);
      return token
    },
    async session({ session, token }) {
      // ✅ LOG 5: Ver la sesión y el token antes de enviarlos al cliente
      console.log("--- PASO 3: CALLBACK SESSION ---");
      console.log("Token recibido en 'session':", token);
      
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role
        session.user.employeeId = token.employeeId
      }

      console.log("Objeto 'session' final enviado al cliente:", session);
      return session
    },
  },
};