// /api/evaluaciones/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'evaluador') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const evaluatorId = session.user.id;

  try {
    const body = await request.json()
    const { 
      employeeId, startDate, endDate, totalScore, possibleScore, 
      averageScore, rubrica, evaluationsData 
    } = body

    // Validación de datos básicos
    if (!employeeId || !startDate || !endDate || !evaluationsData) {
        return NextResponse.json({ error: 'Faltan datos requeridos para el reporte' }, { status: 400 })
    }

    // Usamos una transacción para asegurar que todo se guarde correctamente
    const newWeeklyReport = await prisma.$transaction(async (tx) => {
      // 1. Crear el registro principal del reporte semanal
      const report = await tx.weeklyReport.create({
        data: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          totalScore,
          possibleScore,
          averageScore,
          rubrica,
          employeeId,
          evaluatorId,
        },
      })

      // 2. Preparar los datos de las evaluaciones individuales
      const evaluationsToCreate = evaluationsData.map((evalData: any) => ({
        opportunityId: evalData.opportunityId,
        scoreRaw: evalData.scoreRaw,
        possibleScore: evalData.possibleScore,
        evaluatorId,
        weeklyReportId: report.id, // Enlazar cada evaluación al reporte recién creado
        
        // Mapear respuestas y comentarios
        updatedDate: evalData.responses.updatedDate || '0',
        correctPriceQty: evalData.responses.correctPriceQty || '0',
        quoteUploaded: evalData.responses.quoteUploaded || '0',
        description: evalData.responses.description || '0',
        recentFollowUp: evalData.responses.recentFollowUp || '0',
        correctStage: evalData.responses.correctStage || '0',
        realisticChance: evalData.responses.realisticChance || '0',
        nextStepsDefined: evalData.responses.nextStepsDefined || '0',
        contactAssigned: evalData.responses.contactAssigned || '0',
        commentsUpdated: evalData.responses.commentsUpdated || '0',
        
        updatedDateComment: evalData.comments.updatedDate,
        correctPriceQtyComment: evalData.comments.correctPriceQty,
        quoteUploadedComment: evalData.comments.quoteUploaded,
        descriptionComment: evalData.comments.description,
        recentFollowUpComment: evalData.comments.recentFollowUp,
        correctStageComment: evalData.comments.correctStage,
        realisticChanceComment: evalData.comments.realisticChance,
        nextStepsDefinedComment: evalData.comments.nextStepsDefined,
        contactAssignedComment: evalData.comments.contactAssigned,
        commentsUpdatedComment: evalData.comments.commentsUpdated,
      }));

      // 3. Crear todas las evaluaciones individuales
      await tx.evaluation.createMany({
        data: evaluationsToCreate,
      })

      const employee = await tx.employee.findUnique({
        where:{id:employeeId},
        select:{userId:true}
      })

      return report;
    });

    return NextResponse.json(newWeeklyReport, { status: 201 });

  } catch (error) {
    console.error('Error al crear reporte semanal:', error)
    return NextResponse.json({ error: 'Error interno del servidor al crear el reporte' }, { status: 500 })
  }
}

// Recuerda mantener tu función GET en este archivo si la necesitas para otras vistas
// export async function GET(request: Request) { ... }