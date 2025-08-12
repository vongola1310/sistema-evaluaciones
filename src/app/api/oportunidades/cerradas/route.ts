// /api/oportunidades/route.ts

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // Leemos el parámetro 'status'

    let whereClause = {}

    // Construimos la condición de búsqueda basada en el status
    if (status === 'cerrada') {
      whereClause = { state: 'cerrada' }
    } else if (status === 'abierta') {
      // Usamos 'not' para obtener todas las que NO son 'cerrada'
      whereClause = { state: { not: 'cerrada' } }
    }
    // Si no hay status, se devuelven todas.

    const opportunities = await prisma.opportunity.findMany({
      where: whereClause, // Aplicamos el filtro en la consulta a la BD
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNo: true,
          }
        }
      },
      orderBy: {
        updateAt: 'desc'
      }
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json(
      { error: 'Error al cargar oportunidades' },
      { status: 500 }
    )
  }
}

// Aquí puedes tener también tu función POST para crear oportunidades
// ...