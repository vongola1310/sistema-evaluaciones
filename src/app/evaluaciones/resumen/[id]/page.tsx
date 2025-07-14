// app/evaluaciones/resumen/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Evaluation {
  id: number
  scoreRaw: number
  scoreAverage: number
  createdAt: string
  employee: {
    firstName: string
    lastName: string
    employeeNo: string
  }
  opportunity: {
    number: string
    name: string
  }
  evaluator: {
    name: string
    email: string
  }
  [key: string]: any
}

const camposEvaluacion: Record<string, string> = {
  updatedDate: 'Fecha actualizada',
  correctPriceQty: 'Precio y cantidad correctos',
  quoteUploaded: 'Cotización subida',
  description: 'Descripción',
  recentFollowUp: 'Seguimiento reciente',
  correctStage: 'Etapa correcta',
  realisticChance: 'Probabilidad realista',
  nextStepsDefined: 'Siguientes pasos definidos',
  contactAssigned: 'Contacto asignado',
  commentsUpdated: 'Comentarios actualizados'
}

export default async function ResumenEvaluacionPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/evaluaciones/${params.id}`)
  const data = await res.json()

  if (!res.ok || !data?.data) {
    return notFound()
  }

  const evaluacion: Evaluation = data.data

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-400">Resumen de Evaluación</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p><span className="font-semibold">Empleado:</span> {evaluacion.employee.firstName} {evaluacion.employee.lastName} ({evaluacion.employee.employeeNo})</p>
            <p><span className="font-semibold">Oportunidad:</span> {evaluacion.opportunity.number} - {evaluacion.opportunity.name}</p>
          </div>
          <div>
            <p><span className="font-semibold">Evaluador:</span> {evaluacion.evaluator.name} ({evaluacion.evaluator.email})</p>
            <p><span className="font-semibold">Fecha de evaluación:</span> {new Date(evaluacion.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-lg font-semibold text-center">Puntaje total: <span className="text-green-400">{evaluacion.scoreRaw} / 20</span></p>
          <p className="text-lg font-semibold text-center">Promedio: <span className="text-blue-400">{evaluacion.scoreAverage.toFixed(2)}%</span></p>
        </div>

        <h2 className="text-xl font-bold mb-4">Respuestas detalladas</h2>
        <table className="w-full border border-gray-600 rounded-lg overflow-hidden text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Criterio</th>
              <th className="px-4 py-2 text-left">Respuesta</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(camposEvaluacion).map(([key, label]) => (
              <tr key={key} className="border-t border-gray-600">
                <td className="px-4 py-2 text-gray-300">{label}</td>
                <td className="px-4 py-2">
                  {evaluacion[key] === '0' && '0 - Incumplido'}
                  {evaluacion[key] === '1' && '1 - Parcialmente cumplido'}
                  {evaluacion[key] === '2' && '2 - Totalmente cumplido'}
                  {evaluacion[key] === 'N/A' && 'N/A - No aplica'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link href="/dashboard" className="inline-block mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow">
  ← Regresar al Dashboard
</Link>

    </div>
  )
}
