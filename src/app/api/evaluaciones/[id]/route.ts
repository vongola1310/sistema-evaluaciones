// app/api/evaluaciones/[id]/route.ts

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  const id = parseInt(context.params.id)

  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: 'ID inválido' },
      { status: 400 }
    )
  }

  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNo: true
          }
        },
        opportunity: {
          select: {
            number: true,
            name: true
          }
        },
        evaluator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!evaluation) {
      return NextResponse.json(
        { success: false, error: 'Evaluación no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: evaluation })
  } catch (error) {
    console.error('Error en GET evaluación/:id', error)
    return NextResponse.json(
      { success: false, error: 'Error interno al cargar la evaluación' },
      { status: 500 }
    )
  }
}
