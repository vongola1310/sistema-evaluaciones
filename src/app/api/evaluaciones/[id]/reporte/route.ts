// app/api/evaluaciones/[id]/reporte/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { drawText, PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { error } from "console";

export async function GET(
    _request: Request,
    context: { params: { id: string } }

) {
    const id = parseInt(context.params.id)

    if (isNaN(id)) {
        return NextResponse.json({ error: 'id invalido' }, { status: 400 })
    }

    try {
        const evaluation = await prisma.evaluation.findUnique({
            where: { id },
            include: {
                employee: true,
                opportunity: true,
                evaluator: true
            }
        })

        if (!evaluation) {
            return NextResponse.json({ error: 'Evaluacion no encontrada' }, { status: 404 })
        }
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage()
        const { width, height } = page.getSize()
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

        let y = height - 50
        const lineHeight = 18

        const drawLine = (text: string) => {
            page.drawText(text, {
                x: 50,
                y,
                size: 12,
                font,
                color: rgb(0, 0, 0)
            })
            y -= lineHeight
        }


        drawLine(`Resumen de Evaluación ID: ${evaluation.id}`)
        drawLine(`Empleado: ${evaluation.employee.firstName} ${evaluation.employee.lastName}`)
        drawLine(`Evaluador: ${evaluation.evaluator.name} (${evaluation.evaluator.email})`)
        drawLine(`Oportunidad: ${evaluation.opportunity.name}`)
        drawLine(`Fecha de actualización: ${evaluation.updatedDate}`)
        drawLine(`Trimestre: ${evaluation.trimestre} | Año: ${evaluation.year}`)
        drawLine(`Puntaje: ${evaluation.scoreRaw} de ${evaluation.totalPosibles} (${evaluation.rubrica})`)
        drawLine(`-------------------------------------------`)

        // Preguntas + Comentarios
        const campos = [
            ['Precio correcto', evaluation.correctPriceQty, evaluation.correctPriceQtyComment],
            ['Cotización subida', evaluation.quoteUploaded, evaluation.quoteUploadedComment],
            ['Descripción', evaluation.description, evaluation.descriptionComment],
            ['Seguimiento reciente', evaluation.recentFollowUp, evaluation.recentFollowUpComment],
            ['Etapa correcta', evaluation.correctStage, evaluation.correctStageComment],
            ['Probabilidad realista', evaluation.realisticChance, evaluation.realisticChanceComment],
            ['Siguientes pasos definidos', evaluation.nextStepsDefined, evaluation.nextStepsDefinedComment],
            ['Contacto asignado', evaluation.contactAssigned, evaluation.contactAssignedComment],
            ['Comentarios actualizados', evaluation.commentsUpdated, evaluation.commentsUpdatedComment],
            ['Fecha actualizada', evaluation.updatedDate, evaluation.updateDateComment],
        ]

      for (const [titulo, valor, comentario] of campos) {
      drawLine(`${titulo}: ${valor}`)
      if (comentario) drawLine(`→ Comentario: ${comentario}`)
    }

    const pdfBytes=await pdfDoc.save()

    return new NextResponse(pdfBytes,{
        headers:{
            'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="evaluacion_${evaluation.id}.pdf"`
        }
    })



    } catch (error) {

        console.error('Error al generar el PDF',error)
        return NextResponse.json ({error:'Error interno al generarpdf'},{status:505})

    }

}