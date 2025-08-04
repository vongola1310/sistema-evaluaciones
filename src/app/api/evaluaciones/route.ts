// app/api/evaluaciones/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { error } from 'console'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)


  if (!session?.user || session.user.role !== 'evaluador') {
    return NextResponse.json(
      { success: false, error: 'Acceso no autorizado. Se requiere rol de evaluador' },
      { status: 401 }
    )
  }


  try {
    const data = await request.json()
    console.log('Datos recibidos:', data)

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

    const employeeId = Number(data.employeeId)
    const opportunityId = Number(data.opportunityId)
    const evaluatorId = session.user.id


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

    // Calcular valores nuevos
    let scoreRaw = 0
    let totalPreguntas = 0
    const respuestas: Record<string, string> = {}

    for (const field of evaluationFields) {
      const val = data[field]
      respuestas[field] = val
      if (val !== 'N/A') {
        scoreRaw += parseInt(val)
        totalPreguntas++
      }
    }

    const totalPosibles = totalPreguntas * 2
    const porcentaje = totalPosibles > 0 ? (scoreRaw / totalPosibles) * 100 : 0

    // Calcular trimestre y año actual
    const now = new Date()
    const trimestre = Math.ceil((now.getMonth() + 1) / 3)
    const year = now.getFullYear()

    // Rubrica
    let rubrica = ''
    if (porcentaje >= 90) rubrica = 'Excelente'
    else if (porcentaje >= 75) rubrica = 'Bueno'
    else if (porcentaje >= 50) rubrica = 'Regular'
    else rubrica = 'Bajo rendimiento'


    // Crear evaluación
    const evaluation = await prisma.evaluation.create({

      data: {
        employeeId,
        opportunityId,
        evaluatorId,

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
        // comentarios
        updateDateComment: data.updateDateComment || null,
        correctPriceQtyComment: data.correctPriceQtyComment || null,
        quoteUploadedComment: data.quoteUploadedComment || null,
        descriptionComment: data.descriptionComment || null,
        recentFollowUpComment: data.recentFollowUpComment || null,
        correctStageComment: data.correctStageComment || null,
        realisticChanceComment: data.realisticChanceComment || null,
        nextStepsDefinedComment: data.nextStepsDefinedComment || null,
        contactAssignedComment: data.contactAssignedComment || null,
        commentsUpdatedComment: data.commentsUpdatedComment || null,
        scoreRaw,
        totalPreguntas,
        totalPosibles,
        trimestre,
        year,
        rubrica,

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

    return NextResponse.json({
      success: true,
      data: {
        id: evaluation.id,
        employee: evaluation.employee,
        opportunity: evaluation.opportunity,
        evaluatorId: evaluation.evaluatorId,
        scoreRaw: evaluation.scoreRaw,
        totalPreguntas: evaluation.totalPreguntas,
        totalPosibles: evaluation.totalPosibles,
        trimestre: evaluation.trimestre,
        year: evaluation.year,
        rubrica: evaluation.rubrica,
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
