// src/app/api/evaluaciones/[id]/reporte/route.ts
import { prisma } from '@/lib/prisma'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

/**
 * Reemplaza caracteres Unicode problemáticos por equivalentes ASCII.
 * Puedes ampliar el mapa según lo necesites.
 */
function sanitizeForWinAnsi(input: string | undefined | null): string {
  if (!input) return ''
  let s = String(input)

  // Mapas comunes
  const map: Record<string, string> = {
    '→': '->',
    '—': '-',
    '–': '-',
    '…': '...',
    '“': '"',
    '”': '"',
    '‘': "'",
    '’': "'",
    '•': '-',
    '¢': 'c',
    '€': 'EUR',
    '™': ' TM',
    '✓': 'v',
    '✔': 'v',
  }

  // Reemplazos simples
  for (const [k, v] of Object.entries(map)) {
    s = s.split(k).join(v)
  }

  // Eliminar caracteres de control no visibles
  s = s.replace(/[\u0000-\u001F\u007F]/g, '')

  // Finalmente, si hay caracteres fuera del rango WinAnsi (prácticamente no ASCII extendido), los sustituimos por '?'
  // WinAnsi cubre 0-255 pero pdf-lib con StandardFonts puede fallar en ciertos unicode; hacemos una limpieza básica:
  s = s.replace(/[^\x00-\xFF]/g, (c) => {
    // si es letra IPA o similar, podrías querer mantenerla; aquí lo sustituimos por '?'
    return '?'
  })

  return s
}

export async function GET(
  _request: Request,
  { params }: { params?: { id?: string } }
) {
  try {
    const idStr = params?.id
    const id = idStr ? parseInt(idStr, 10) : NaN

    if (Number.isNaN(id)) {
      return new Response(JSON.stringify({ error: 'id inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        employee: true,
        opportunity: true,
        evaluator: true,
      },
    })

    if (!evaluation) {
      return new Response(JSON.stringify({ error: 'Evaluación no encontrada' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }

    // Crear PDF
    const pdfDoc = await PDFDocument.create()

    // === Opción B (comentada): si quieres soporte Unicode completo, descomenta y coloca un TTF en public/fonts
    // const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Inter-Regular.ttf')
    // const fontBytes = fs.readFileSync(fontPath)
    // const font = await pdfDoc.embedFont(fontBytes)
    //
    // Si usas la fuente TTF anterior, ya no necesitas sanitizeForWinAnsi tanto.

    // Usaremos la fuente estándar (WinAnsi), por lo que saneamos los textos
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    let page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const lineHeight = 16
    let y = height - 50

    const drawLine = (text: string) => {
      // Sanitizar el texto para evitar errores de codificación
      const safe = sanitizeForWinAnsi(text)
      if (y < 60) {
        page = pdfDoc.addPage()
        y = page.getSize().height - 50
      }
      page.drawText(safe, {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0, 0, 0),
      })
      y -= lineHeight
    }

    // Datos defensivos
    const evaluatorName = (evaluation.evaluator as any)?.fullName ?? (evaluation.evaluator as any)?.name ?? '-'
    const evaluatorEmail = (evaluation.evaluator as any)?.email ?? '-'
    const empFirst = (evaluation.employee as any)?.firstName ?? ''
    const empLast = (evaluation.employee as any)?.lastName ?? ''
    const empNo = (evaluation.employee as any)?.employeeNo ?? '-'
    const oppNumber = (evaluation.opportunity as any)?.number ?? '-'
    const oppName = (evaluation.opportunity as any)?.name ?? '-'
    const createdAt = evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleString() : '-'

    drawLine(`Resumen de Evaluación ID: ${evaluation.id}`)
    drawLine(`Empleado: ${empFirst} ${empLast} (${empNo})`)
    drawLine(`Evaluador: ${evaluatorName} (${evaluatorEmail})`)
    drawLine(`Oportunidad: ${oppNumber} - ${oppName}`)
    drawLine(`Fecha de creación: ${createdAt}`)
    drawLine(`Puntaje: ${evaluation.scoreRaw ?? '-'} de ${((evaluation as any).totalPosibles ?? '-')}`)
    drawLine('-------------------------------------------')

    const campos: [string, any, any][] = [
      ['Precio correcto', (evaluation as any).correctPriceQty, (evaluation as any).correctPriceQtyComment],
      ['Cotización subida', (evaluation as any).quoteUploaded, (evaluation as any).quoteUploadedComment],
      ['Descripción', (evaluation as any).description, (evaluation as any).descriptionComment],
      ['Seguimiento reciente', (evaluation as any).recentFollowUp, (evaluation as any).recentFollowUpComment],
      ['Etapa correcta', (evaluation as any).correctStage, (evaluation as any).correctStageComment],
      ['Probabilidad realista', (evaluation as any).realisticChance, (evaluation as any).realisticChanceComment],
      ['Siguientes pasos definidos', (evaluation as any).nextStepsDefined, (evaluation as any).nextStepsDefinedComment],
      ['Contacto asignado', (evaluation as any).contactAssigned, (evaluation as any).contactAssignedComment],
      ['Comentarios actualizados', (evaluation as any).commentsUpdated, (evaluation as any).commentsUpdatedComment],
    ]

    for (const [titulo, valor, comentario] of campos) {
      drawLine(`${titulo}: ${valor ?? '-'}`)
      if (comentario) drawLine(`-> Comentario: ${comentario}`)
    }

    const pdfBytes = await pdfDoc.save()

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(pdfBytes.length),
        'Content-Disposition': `attachment; filename="evaluacion_${evaluation.id}.pdf"`,
      },
    })
  } catch (err) {
    console.error('Error al generar el PDF', err)
    return new Response(JSON.stringify({ error: 'Error interno al generar PDF' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
