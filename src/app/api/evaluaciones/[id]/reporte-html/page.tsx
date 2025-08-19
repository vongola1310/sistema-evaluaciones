// src/app/evaluaciones/reporte-html/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ReporteHTML({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)

  if (isNaN(id)) return notFound()

  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: {
      employee: true,
      opportunity: true,
      evaluator: true,
    },
  })

  if (!evaluation) return notFound()

  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <title>Reporte evaluación #{evaluation.id}</title>
        <style>{`
          body {
            font-family: Arial, sans-serif;
            padding: 2rem;
            color: #111;
            background-color: #fff;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 1rem;
          }
          p {
            margin: 4px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
            font-size: 14px;
          }
          th {
            background-color: #f0f0f0;
          }
        `}</style>
      </head>
      <body>
        <h1>Resumen de Evaluación</h1>
        <p><strong>ID:</strong> {evaluation.id}</p>
        <p><strong>Empleado:</strong> {evaluation.employee.firstName} {evaluation.employee.lastName} ({evaluation.employee.employeeNo})</p>
        <p><strong>Evaluador:</strong> {evaluation.evaluator.name} ({evaluation.evaluator.email})</p>
        <p><strong>Oportunidad:</strong> {evaluation.opportunity.number} - {evaluation.opportunity.name}</p>
        <p><strong>Fecha de creación:</strong> {evaluation.createdAt.toLocaleString()}</p>
        <p><strong>Puntaje:</strong> {evaluation.scoreRaw} de {(evaluation as any).totalPosibles}</p>

        <table>
          <thead>
            <tr>
              <th>Criterio</th>
              <th>Valor</th>
              <th>Comentario</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Precio correcto', (evaluation as any).correctPriceQty, (evaluation as any).correctPriceQtyComment],
              ['Cotización subida', (evaluation as any).quoteUploaded, (evaluation as any).quoteUploadedComment],
              ['Descripción', (evaluation as any).description, (evaluation as any).descriptionComment],
              ['Seguimiento reciente', (evaluation as any).recentFollowUp, (evaluation as any).recentFollowUpComment],
              ['Etapa correcta', (evaluation as any).correctStage, (evaluation as any).correctStageComment],
              ['Probabilidad realista', (evaluation as any).realisticChance, (evaluation as any).realisticChanceComment],
              ['Siguientes pasos definidos', (evaluation as any).nextStepsDefined, (evaluation as any).nextStepsDefinedComment],
              ['Contacto asignado', (evaluation as any).contactAssigned, (evaluation as any).contactAssignedComment],
              ['Comentarios actualizados', (evaluation as any).commentsUpdated, (evaluation as any).commentsUpdatedComment],
            ].map(([label, value, comment], i) => (
              <tr key={i}>
                <td>{label}</td>
                <td>{value ?? 'N/A'}</td>
                <td>{comment ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </body>
    </html>
  )
}
