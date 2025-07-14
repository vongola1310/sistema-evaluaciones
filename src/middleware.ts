import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware (req: NextRequest){
    const token = await getToken ({req})

    // si no esta autenticado 

    if (!token){
        return NextResponse.redirect(new URL('/login',req.url))
    }

    // si no es evaluador
    if (token.role !== 'evaluador'){
        return NextResponse.redirect(new URL('/no-autorizado',req.url))
    }

    //dejar pasar si todo bien
    return NextResponse.next()

    
}

export const config = {
    matcher:[
        '/empleados/nuevo/',
        '/empleados/:path*',
        '/empleados/',
        '/evaluaciones/nueva/:path*',
        '/evaluaciones/:path*',
        '/oportunidades/nueva/:path*',
        '/oportunidades/:path*',
        '/dashboard/:path*',
        '/empleados/nuevo/:path*',
        '/evaluaciones/nueva',
        '/evaluaciones/',
        '/evaluaciones/resumen/[id]/',
        '/evaluaciones/:path*'
    ],
}


