// src/app/api/oportunidades/cerradas/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'evaluador') {
    return NextResponse.json(
      { success: false, error: 'Acceso no autorizado' },
      { status: 401 }
    )
  }

  try {
    const url = new URL(request.url)
    const employeeId = url.searchParams.get('employeeId')

    // Construir el filtro
    const whereCondition: any = {
      state: 'cerrada'
    }

    // Si se especifica un empleado, filtrar por él
    if (employeeId && employeeId !== 'todos') {
      whereCondition.evaluations = {
        some: {
          employeeId: parseInt(employeeId, 10)
        }
      }
    }

    const oportunidadesCerradas = await prisma.opportunity.findMany({
      where: {state:'activa'},
      select: {
        id: true,
        number: true,
        name: true,
        createdAt: true,
        updateAt: true,
        state: true,
        evaluations: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeNo: true
              }
            }
          }
        }
      },
      orderBy: {
        updateAt: 'desc' // Ordenar por fecha de cierre (más recientes primero)
      }
    })

    // Agregar log temporal para debug
    console.log('Primera oportunidad raw:', oportunidadesCerradas[0])

    return NextResponse.json({ 
      success: true, 
      data: oportunidadesCerradas,
      count: oportunidadesCerradas.length
    })
  } catch (error) {
    console.error('Error al obtener oportunidades cerradas:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}