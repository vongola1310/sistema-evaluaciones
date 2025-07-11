// app/api/evaluaciones/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  // 1. Validar autenticación y rol
  if (!session?.user || session.user.role !== 'evaluador') {
    return NextResponse.json(
      { success: false, error: 'Acceso no autorizado. Se requiere rol de evaluador' },
      { status: 401 }
    )
  }

  try {
    const data = await request.json()
    console.log('Datos recibidos:', data)

    // 2. Validar campos requeridos
    const requiredFields = ['employeeId', 'opportunityId']
    const missingFields = requiredFields.filter(field => !data[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Campos requeridos faltantes',
          details: `Faltan: ${missingFields.join(', ')}`
        },
        { status: 400 }
      )
    }

    // 3. Convertir IDs (employeeId y opportunityId son números, evaluatorId es string)
    const employeeId = Number(data.employeeId)
    const opportunityId = Number(data.opportunityId)
    const evaluatorId = session.user.id // Usamos el string ID del usuario

    // Validar conversión numérica
    if (isNaN(employeeId) || isNaN(opportunityId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'IDs inválidos',
          details: `employeeId: ${data.employeeId}, opportunityId: ${data.opportunityId}`
        },
        { status: 400 }
      )
    }

    // 4. Verificar existencia de registros relacionados
    const [employee, opportunity] = await Promise.all([
      prisma.employee.findUnique({ where: { id: employeeId } }),
      prisma.opportunity.findUnique({ where: { id: opportunityId } })
    ])

    if (!employee || !opportunity) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Registros relacionados no encontrados',
          details: {
            employeeExists: !!employee,
            opportunityExists: !!opportunity
          }
        },
        { status: 404 }
      )
    }

    // 5. Validar campos de evaluación (0, 1, 2 o N/A)
    const evaluationFields = [
      'updatedDate', 'correctPriceQty', 'quoteUploaded',
      'description', 'recentFollowUp', 'correctStage',
      'realisticChance', 'nextStepsDefined', 'contactAssigned',
      'commentsUpdated'
    ]

    for (const field of evaluationFields) {
      if (!['0', '1', '2', 'N/A'].includes(data[field])) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Valor de evaluación inválido',
            details: `Campo ${field} debe ser 0, 1, 2 o N/A`
          },
          { status: 400 }
        )
      }
    }

    // 6. Crear la evaluación
    const evaluation = await prisma.evaluation.create({
      data: {
        employeeId,
        evaluatorId, // ID de usuario como string
        opportunityId,
        updatedDate: data.updatedDate || '0',
        correctPriceQty: data.correctPriceQty || '0',
        quoteUploaded: data.quoteUploaded || '0',
        description: data.description || '0',
        recentFollowUp: data.recentFollowUp || '0',
        correctStage: data.correctStage || '0',
        realisticChance: data.realisticChance || '0',
        nextStepsDefined: data.nextStepsDefined || '0',
        contactAssigned: data.contactAssigned || '0',
        commentsUpdated: data.commentsUpdated || '0',
        scoreRaw: data.scoreRaw || 0,
        scoreAverage: data.scoreAverage || 0
      },
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
        }
      }
    })

    // 7. Retornar respuesta exitosa
    return NextResponse.json({
      success: true,
      data: {
        id: evaluation.id,
        employee: evaluation.employee,
        opportunity: evaluation.opportunity,
        evaluatorId: evaluation.evaluatorId,
        score: evaluation.scoreAverage,
        createdAt: evaluation.createdAt
      }
    }, { status: 201 })

  } catch (error: unknown) {
    console.error('Error en el servidor:', error)
    
    let errorMessage = 'Error interno del servidor'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.stack : null
        })
      },
      { status: 500 }
    )
  }
}

// Opcional: Endpoint GET para obtener evaluaciones
export async function GET(request: Request) {
  try {
    const evaluations = await prisma.evaluation.findMany({
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
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

    return NextResponse.json({
      success: true,
      data: evaluations
    })

  } catch (error: unknown) {
    console.error('Error al obtener evaluaciones:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al cargar evaluaciones'
      },
      { status: 500 }
    )
  }
}