// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // --- REGLAS DE ACCESO ---

  // 1. Si el usuario NO está logueado Y no está intentando acceder a login/registro
  if (!token && pathname !== "/login" && pathname !== "/registro") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Si el usuario YA está logueado
  if (token) {
    const role = token.role;

    // Si intenta acceder a login o registro, redirigirlo a su dashboard
    if (pathname === "/login" || pathname === "/registro") {
      const url = role === 'employee' ? '/mis-evaluaciones' : '/dashboard';
      return NextResponse.redirect(new URL(url, req.url));
    }

    // Si es un EMPLEADO y trata de acceder a una ruta de EVALUADOR
    if (role === 'employee' && !pathname.startsWith('/mis-evaluaciones')) {
      return NextResponse.redirect(new URL('/mis-evaluaciones', req.url));
    }
    
    // Si es un EVALUADOR y trata de acceder a una ruta de EMPLEADO
    if (role === 'evaluador' && pathname.startsWith('/mis-evaluaciones')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // 3. Si ninguna de las reglas anteriores se cumple, permitir el acceso
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto las que son para archivos estáticos,
     * optimización de imágenes o rutas internas de Next.js.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|LOGO EUROIMMUN REVV-V1.jpg).*)',
  ],
}