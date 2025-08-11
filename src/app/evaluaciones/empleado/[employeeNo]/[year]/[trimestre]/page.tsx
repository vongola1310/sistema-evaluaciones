import { notFound } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/MainLayout"
interface Evaluation {
  id: number
  scoreRaw: number
  totalPosibles: number
  createdAt: string
  opportunity: {
    number: string
    name: string
  }
  evaluator: {
    name: string
    email: string
  }
}

export default async function EvaluacionesPorEmpleadoPage({
  params,
}: {
  params: { employeeNo: string; year: string; trimestre: string }
}) {
  const { employeeNo, year, trimestre } = params

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/evaluaciones/empleado/${employeeNo}/${year}/${trimestre}`,
    { cache: 'no-cache' }
  )
  const data = await res.json()

  if (!res.ok || !data?.data) return notFound()

  const evaluaciones: Evaluation[] = data.data

  return (
    <MainLayout>
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold text-green-400 mb-6 text-center">
        Evaluaciones del Empleado #{employeeNo} - Q{trimestre} {year}
      </h1>

      {evaluaciones.length === 0 ? (
        <p className="text-center text-gray-400">No se encontraron evaluaciones.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-700 rounded overflow-hidden">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="px-4 py-2 text-left">Oportunidad</th>
                <th className="px-4 py-2 text-left">Evaluador</th>
                <th className="px-4 py-2 text-left">Puntaje</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Resumen</th>
              </tr>
            </thead>
            <tbody>
              {evaluaciones.map((e) => {
                const porcentaje =
                  e.totalPosibles > 0
                    ? ((e.scoreRaw / e.totalPosibles) * 100).toFixed(2)
                    : '0.00'
                return (
                  <tr key={e.id} className="border-t border-gray-700 hover:bg-gray-800">
                    <td className="px-4 py-2">
                      {e.opportunity.number} - {e.opportunity.name}
                    </td>
                    <td className="px-4 py-2">{e.evaluator.name}</td>
                    <td className="px-4 py-2 text-green-400 font-semibold">
                      {e.scoreRaw} / {e.totalPosibles} ({porcentaje}%)
                    </td>
                    <td className="px-4 py-2">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/evaluaciones/resumen/${e.id}`}
                        className="text-blue-400 hover:underline"
                      >
                        Ver resumen
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Link
        href="/evaluaciones/panel"
        className="inline-block mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow"
      >
        ← Volver al panel acumulado
      </Link>
    </div>
    </MainLayout>
  )
}
