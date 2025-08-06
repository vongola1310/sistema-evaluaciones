// src/app/evaluaciones/resumen/[id]/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

type ParamsType = {
  params: { id: string }
  searchParams: { pdf?: string }
}


import { DownloadReportButton } from '@/components/DownloadReportButton'

export default async function ResumenEvaluacionPage({ params, searchParams }: ParamsType) {
  const id = parseInt(params.id)

  if (Number.isNaN(id)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-600/10 border border-red-600 text-red-200 p-6 rounded">
          <h2 className="text-xl font-semibold">ID inválido</h2>
          <p className="mt-2">El identificador de la evaluación no es válido.</p>
          <Link href="/evaluaciones" className="inline-block mt-4 text-sm underline">
            Volver a evaluaciones
          </Link>
        </div>
      </div>
    )
  }

  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: {
      employee: true,
      evaluator: true,
      opportunity: true,
    },
  })

  if (!evaluation) return notFound()

  const isPDF = searchParams?.pdf === 'true'

  const empFirst = (evaluation.employee as any)?.firstName ?? ''
  const empLast = (evaluation.employee as any)?.lastName ?? ''
  const empNo = (evaluation.employee as any)?.employeeNo ?? '-'
  const evaluatorName = (evaluation.evaluator as any)?.fullName ?? (evaluation.evaluator as any)?.name ?? '-'
  const evaluatorEmail = (evaluation.evaluator as any)?.email ?? '-'
  const oppNumber = (evaluation.opportunity as any)?.number ?? '-'
  const oppName = (evaluation.opportunity as any)?.name ?? '-'
  const createdAt = evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleString() : '-'
  const scoreRaw = (evaluation as any).scoreRaw ?? '-'
  const totalPosibles = (evaluation as any).totalPosibles ?? '-'

  const campos: { key: string; label: string; value: any; comment?: any }[] = [
    { key: 'correctPriceQty', label: 'Precio correcto', value: (evaluation as any).correctPriceQty, comment: (evaluation as any).correctPriceQtyComment },
    { key: 'quoteUploaded', label: 'Cotización subida', value: (evaluation as any).quoteUploaded, comment: (evaluation as any).quoteUploadedComment },
    { key: 'description', label: 'Descripción', value: (evaluation as any).description, comment: (evaluation as any).descriptionComment },
    { key: 'recentFollowUp', label: 'Seguimiento reciente', value: (evaluation as any).recentFollowUp, comment: (evaluation as any).recentFollowUpComment },
    { key: 'correctStage', label: 'Etapa correcta', value: (evaluation as any).correctStage, comment: (evaluation as any).correctStageComment },
    { key: 'realisticChance', label: 'Probabilidad realista', value: (evaluation as any).realisticChance, comment: (evaluation as any).realisticChanceComment },
    { key: 'nextStepsDefined', label: 'Siguientes pasos definidos', value: (evaluation as any).nextStepsDefined, comment: (evaluation as any).nextStepsDefinedComment },
    { key: 'contactAssigned', label: 'Contacto asignado', value: (evaluation as any).contactAssigned, comment: (evaluation as any).contactAssignedComment },
    { key: 'commentsUpdated', label: 'Comentarios actualizados', value: (evaluation as any).commentsUpdated, comment: (evaluation as any).commentsUpdatedComment },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h1 className="text-2xl font-bold">Resumen de Evaluación</h1>
            <p className="text-sm text-gray-300 mt-1">ID: <span className="font-mono">{evaluation.id}</span></p>
          </div>

          {!isPDF && (
            <div className="flex items-center gap-3">
              <DownloadReportButton evaluationId={evaluation.id} />

              <Link
                href="/evaluaciones/panel"
                className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm"
              >
                ← Volver
              </Link>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/30 p-4 rounded">
              <p className="text-sm text-gray-300">Empleado</p>
              <p className="font-semibold text-lg">{empFirst} {empLast}</p>
              <p className="text-sm text-gray-400">Número: <span className="font-mono">{empNo}</span></p>
            </div>

            <div className="bg-gray-900/30 p-4 rounded">
              <p className="text-sm text-gray-300">Evaluador</p>
              <p className="font-semibold text-lg">{evaluatorName}</p>
              <p className="text-sm text-gray-400">{evaluatorEmail}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Oportunidad</p>
              <p className="font-medium">{oppNumber} - {oppName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Fecha de creación</p>
              <p className="font-medium">{createdAt}</p>
            </div>
          </div>

          <div className="bg-gray-900/20 p-4 rounded">
            <p className="text-sm text-gray-300">Puntaje</p>
            <p className="text-2xl font-bold">{scoreRaw} <span className="text-gray-400 text-base">de {totalPosibles}</span></p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto bg-gray-800 rounded divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 text-sm text-gray-200">Criterio</th>
                  <th className="text-left px-4 py-3 text-sm text-gray-200">Valor</th>
                  <th className="text-left px-4 py-3 text-sm text-gray-200">Comentario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {campos.map((c) => (
                  <tr key={c.key} className="odd:bg-gray-900 even:bg-gray-800">
                    <td className="px-4 py-3 text-sm">{c.label}</td>
                    <td className="px-4 py-3 font-medium">{c.value ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{c.comment ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
