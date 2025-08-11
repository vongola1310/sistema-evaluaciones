'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
interface Opportunity {
  id: number
  number: string
  name: string
  state: string
  employee: {
    id: number
    firstName: string
    lastName: string
    employeeNo: string
  }
}

export default function ListadoOportunidades() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState('')

  const fetchData = async () => {
    try {
      const res = await fetch('/api/oportunidades')
      if (!res.ok) throw new Error('Error al cargar oportunidades')
      const data = await res.json()
      setOpportunities(data.filter((opp: Opportunity) => opp.state !== 'cerrada'))
    } catch (error) {
      console.error(error)
      toast.error('No se pudieron cargar las oportunidades')
    } finally {
      setLoading(false)
    }
  }

  const cerrarOportunidad = async (id: number) => {
    const confirmacion = confirm('¿Seguro que deseas cerrar esta oportunidad?')
    if (!confirmacion) return

    try {
      const res = await fetch(`/api/oportunidades/${id}/cerrar`, {
        method: 'PATCH',
      })
      if (!res.ok) throw new Error('Error al cerrar oportunidad')

      setOpportunities((prev) => prev.filter((opp) => opp.id !== id))
      toast.success('Oportunidad cerrada correctamente')
    } catch (error) {
      console.error(error)
      toast.error('No se pudo cerrar la oportunidad')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const empleadosUnicos = Array.from(
    new Map(
      opportunities.map((opp) => [
        opp.employee.id,
        {
          id: opp.employee.id,
          fullName: `${opp.employee.firstName} ${opp.employee.lastName} (${opp.employee.employeeNo})`
        }
      ])
    ).values()
  )

  const filteredOpportunities = selectedEmployee
    ? opportunities.filter((opp) => opp.employee.id.toString() === selectedEmployee)
    : opportunities

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-lg">Cargando oportunidades...</p>
      </div>
    )
  }

  return (
    <MainLayout>
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-green-400">
          Listado de Oportunidades
        </h1>
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white font-semibold"
          >
            ← Regresar al Dashboard
          </Link>
          <Link
            href="/oportunidades/nueva"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
          >
            + Crear Oportunidad
          </Link>
        </div>
      </div>

      <div className="mb-4 max-w-md">
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded focus:outline-none focus:ring focus:ring-green-500"
        >
          <option value="">Todos los empleados</option>
          {empleadosUnicos.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-700 rounded overflow-hidden">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Número</th>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Empleado asignado</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOpportunities.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-400">
                  No hay oportunidades abiertas
                </td>
              </tr>
            ) : (
              filteredOpportunities.map((opp) => (
                <tr
                  key={opp.id}
                  className="border-t border-gray-700 hover:bg-gray-800"
                >
                  <td className="px-4 py-2">{opp.number}</td>
                  <td className="px-4 py-2">{opp.name}</td>
                  <td className="px-4 py-2">
                    {opp.employee.firstName} {opp.employee.lastName} ({opp.employee.employeeNo})
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => cerrarOportunidad(opp.id)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
                    >
                      Cerrar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </MainLayout>
  )
}
