'use client'
import { useEffect, useState } from "react"
import Link from "next/link"

interface Evaluation {
    id: number
    scoreAverage: number
    createdAt: string
    employee: {
        firstName: string
        lastName: string
    }
    opportunity: {
        number: string
        name: string
    }
    evaluator: {
        name: string
        email: string
    }
}

export default function EvaluacionesPage() {
    const [evaluaciones, setEvaluaciones] = useState<Evaluation[]>([])
    const [filtroEmpleado, setFiltroEmpleado] = useState('')
    const [filtroOportunidad, setFiltroOportunidad] = useState('')
    const [filtroEvaluador, setFiltroEvaluador] = useState('')


    useEffect(() => {
        const CargarEvaluaciones = async () => {
            const res = await fetch('/api/evaluaciones')
            const data = await res.json()
            if (res.ok) {
                setEvaluaciones(data.data)
            }
        }
        CargarEvaluaciones()
    },[])
 const evaluacionesFiltradas = evaluaciones.filter(e => {
    const nombreEmpleado = `${e.employee.firstName} ${e.employee.lastName}`.toLowerCase()
    const nombreOportunidad = `${e.opportunity.number} ${e.opportunity.name}`.toLowerCase()
    const nombreEvaluador = `${e.evaluator.name}`.toLowerCase()

    return (
      nombreEmpleado.includes(filtroEmpleado.toLowerCase()) &&
      nombreOportunidad.includes(filtroOportunidad.toLowerCase()) &&
      nombreEvaluador.includes(filtroEvaluador.toLowerCase())
    )
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-400">Listado de Evaluaciones</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Filtrar por empleado"
          value={filtroEmpleado}
          onChange={(e) => setFiltroEmpleado(e.target.value)}
          className="bg-gray-800 p-2 rounded border border-gray-700 focus:outline-none focus:ring focus:ring-green-500"
        />
        <input
          type="text"
          placeholder="Filtrar por oportunidad"
          value={filtroOportunidad}
          onChange={(e) => setFiltroOportunidad(e.target.value)}
          className="bg-gray-800 p-2 rounded border border-gray-700 focus:outline-none focus:ring focus:ring-green-500"
        />
        <input
          type="text"
          placeholder="Filtrar por evaluador"
          value={filtroEvaluador}
          onChange={(e) => setFiltroEvaluador(e.target.value)}
          className="bg-gray-800 p-2 rounded border border-gray-700 focus:outline-none focus:ring focus:ring-green-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-700 rounded overflow-hidden">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Empleado</th>
              <th className="px-4 py-2 text-left">Oportunidad</th>
              <th className="px-4 py-2 text-left">Evaluador</th>
              <th className="px-4 py-2 text-left">Promedio</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {evaluacionesFiltradas.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">No se encontraron evaluaciones</td>
              </tr>
            )}
            {evaluacionesFiltradas.map((e) => (
              <tr key={e.id} className="border-t border-gray-700 hover:bg-gray-800">
                <td className="px-4 py-2">{e.employee.firstName} {e.employee.lastName}</td>
                <td className="px-4 py-2">{e.opportunity.number} - {e.opportunity.name}</td>
                <td className="px-4 py-2">{e.evaluator.name}</td>
                <td className="px-4 py-2 text-green-400 font-semibold">{e.scoreAverage.toFixed(2)}%</td>
                <td className="px-4 py-2">{new Date(e.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <Link href={`/evaluaciones/resumen/${e.id}`} className="text-blue-400 hover:underline">
                    Ver resumen
                  </Link>
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