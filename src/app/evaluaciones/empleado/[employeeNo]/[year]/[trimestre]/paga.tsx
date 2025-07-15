'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Evaluacion {
  id: number
  createdAt: string
  scoreRaw: number
  totalPosibles: number
  rubrica: string
  opportunity: {
    number: string
    name: string
  }
  evaluator: {
    name: string
    email: string
  }
}

export default function EvaluacionesEmpleadoPage() {
  const params = useParams()
  const { employeeId, year, trimestre } = params as {
    employeeId: string
    year: string
    trimestre: string
  }

  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])

  useEffect(() => {
    const fetchEvaluaciones = async () => {
      const res = await fetch(`/api/evaluaciones/empleado/${employeeId}/${year}/${trimestre}`)
      const data = await res.json()
      if (res.ok) {
        setEvaluaciones(data.data)
      }
    }
    fetchEvaluaciones()
  }, [employeeId, year, trimestre])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold text-green-400 mb-4 text-center">
        Evaluaciones del Empleado (Q{trimestre} {year})
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-700 rounded overflow-hidden">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Oportunidad</th>
              <th className="px-4 py-2 text-left">Evaluador</th>
              <th className="px-4 py-2 text-left">Puntaje</th>
              <th className="px-4 py-2 text-left">Rúbrica</th>
              <th className="px-4 py-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {evaluaciones.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-400">No hay evaluaciones en este periodo</td>
              </tr>
            ) : (
              evaluaciones.map((e) => (
                <tr key={e.id} className="border-t border-gray-700 hover:bg-gray-800">
                  <td className="px-4 py-2">{e.opportunity.number} - {e.opportunity.name}</td>
                  <td className="px-4 py-2">{e.evaluator.name}</td>
                  <td className="px-4 py-2 text-green-400 font-semibold">{e.scoreRaw} / {e.totalPosibles}</td>
                  <td className="px-4 py-2">{e.rubrica}</td>
                  <td className="px-4 py-2">{new Date(e.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Link href="/evaluaciones/panel" className="inline-block mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow">
        ← Regresar al Panel
      </Link>
    </div>
  )
}
