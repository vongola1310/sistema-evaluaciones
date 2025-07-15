// app/api/evaluaciones/empleado/[employeeId]/[year]/[trimestre]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { employeeId: string, year: string, trimestre: string } }
) {
  try {
    const employeeId = parseInt(params.employeeId)
    const year = parseInt(params.year)
    const trimestre = parseInt(params.trimestre)

    if (isNaN(employeeId) || isNaN(year) || isNaN(trimestre)) {
      return NextResponse.json({ success: false, error: 'Parámetros inválidos' }, { status: 400 })
    }

    const evaluaciones = await prisma.evaluation.findMany({
      where: {
        employeeId,
        year,
        trimestre
      },
      include: {
        evaluator: {
          select: {
            name: true,
            email: true
          }
        },
        opportunity: {
          select: {
            number: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ success: true, data: evaluaciones })
  } catch (error) {
    console.error('Error al obtener evaluaciones del empleado:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
