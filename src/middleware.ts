// middleware.ts
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PDF_SECRET = 'XYZ123' // mismo que usas en el fetch de Puppeteer

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  // 1. Permitir acceso sin token si es petición a reporte con secret
  if (
    pathname.startsWith("/evaluaciones/resumen/") &&
    searchParams.get("pdf") === "true" &&
    searchParams.get("secret") === PDF_SECRET
  ) {
    return NextResponse.next()
  }

  const token = await getToken({ req })

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (token.role !== "evaluador") {
    return NextResponse.redirect(new URL("/no-autorizado", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/empleados/:path*",
    "/evaluaciones/:path*",
    "/oportunidades/:path*",
    "/dashboard/:path*",
    

  ],
}
