// Obtener empleados únicos de las evaluaciones// src/components/OportunidadesCerradasClient.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Employee {
  id: number
  firstName: string
  lastName: string
  employeeNo: string
}

interface Evaluation {
  employee: Employee
}

interface OportunidadCerrada {
  id: number
  number: string
  name: string
  createdAt: string | Date | null
  updatedAt: string | Date | null
  evaluations: Evaluation[]
}

interface ApiResponse {
  success: boolean
  data: OportunidadCerrada[]
  count: number
  error?: string
}

export default function OportunidadesCerradasClient() {
  const [oportunidades, setOportunidades] = useState<OportunidadCerrada[]>([])
  const [empleados, setEmpleados] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>('todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Cargar lista de empleados para el filtro
  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await fetch('/api/empleados')
        const data = await response.json()
        
        // Adaptamos la respuesta de la API de empleados
        const empleadosFormateados = data.map((emp: any) => ({
          id: emp.id || extractIdFromFullName(emp.fullName),
          firstName: extractFirstName(emp.fullName),
          lastName: extractLastName(emp.fullName),
          employeeNo: extractEmployeeNo(emp.fullName)
        }))
        
        setEmpleados(empleadosFormateados)
      } catch (err) {
        console.error('Error al cargar empleados:', err)
      }
    }

    fetchEmpleados()
  }, [])

  // Funciones auxiliares para extraer datos del formato "Nombre Apellido (NUM)"
  const extractIdFromFullName = (fullName: string) => {
    // Si tienes el ID en tu API, úsalo directamente
    return Math.random() // Temporal, deberías ajustar tu API
  }

  const extractFirstName = (fullName: string) => {
    return fullName.split(' ')[0] || ''
  }

  const extractLastName = (fullName: string) => {
    const parts = fullName.split(' ')
    const lastName = parts.slice(1).join(' ').replace(/\s*\([^)]*\)/, '').trim()
    return lastName
  }

  const extractEmployeeNo = (fullName: string) => {
    const match = fullName.match(/\(([^)]+)\)/)
    return match ? match[1] : ''
  }

  // Cargar oportunidades cerradas
  const fetchOportunidades = async (employeeId: string = 'todos') => {
    setLoading(true)
    setError('')

    try {
      const url = employeeId === 'todos' 
        ? '/api/oportunidades/cerradas'
        : `/api/oportunidades/cerradas?employeeId=${employeeId}`

      const response = await fetch(url)
      const result: ApiResponse = await response.json()

      if (result.success) {
        setOportunidades(result.data)
      } else {
        setError(result.error || 'Error al cargar oportunidades')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOportunidades(selectedEmployee)
  }, [selectedEmployee])

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmployee(e.target.value)
  }

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Fecha no disponible'
    
    try {
      const date = dateString instanceof Date ? dateString : new Date(dateString)
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida'
      }
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error al formatear fecha:', error, 'Valor recibido:', dateString)
      return 'Error en fecha'
    }
  }

  const calculateDuration = (createdAt: string | Date | null, updatedAt: string | Date | null) => {
    if (!createdAt || !updatedAt) return 'Duración no disponible'
    
    try {
      const startDate = createdAt instanceof Date ? createdAt : new Date(createdAt)
      const endDate = updatedAt instanceof Date ? updatedAt : new Date(updatedAt)
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 'Duración inválida'
      }
      
      const diffInMs = endDate.getTime() - startDate.getTime()
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
      const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (diffInDays > 0) {
        return `${diffInDays} día${diffInDays > 1 ? 's' : ''} y ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`
      } else if (diffInHours > 0) {
        return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} y ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`
      } else {
        return `${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`
      }
    } catch (error) {
      console.error('Error al calcular duración:', error)
      return 'Error en duración'
    }
  }
  const getUniqueEmployees = (evaluations: Evaluation[]) => {
    const unique = evaluations.filter((evaluation, index, self) => 
      index === self.findIndex(e => e.employee.id === evaluation.employee.id)
    )
    return unique.map(evaluation => evaluation.employee)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
        <span className="ml-4 text-gray-400">Cargando oportunidades cerradas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtro por empleado */}
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label htmlFor="employee-filter" className="text-sm font-medium text-gray-300">
            Filtrar por empleado:
          </label>
          <select
            id="employee-filter"
            value={selectedEmployee}
            onChange={handleEmployeeChange}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none"
          >
            <option value="todos">Todos los empleados</option>
            {empleados.map((empleado) => (
              <option key={empleado.id} value={empleado.id}>
                {empleado.firstName} {empleado.lastName} ({empleado.employeeNo})
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-400">
            {oportunidades.length} oportunidades encontradas
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Lista de oportunidades */}
      {oportunidades.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            No hay oportunidades cerradas
            {selectedEmployee !== 'todos' && ' para el empleado seleccionado'}
          </div>
          <Link
            href="/oportunidades/nueva"
            className="inline-block bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Crear nueva oportunidad
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {oportunidades.map((oportunidad) => (
            <div key={oportunidad.id} className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      CERRADA
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {oportunidad.name}
                      </h3>
                      <p className="text-gray-400">
                        Número: <span className="font-mono">{oportunidad.number}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Creada:</span>
                      <p className="text-white">{formatDate(oportunidad.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Cerrada:</span>
                      <p className="text-white">{formatDate(oportunidad.updatedAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Duración:</span>
                      <p className="text-green-400 font-semibold">
                        {calculateDuration(oportunidad.createdAt, oportunidad.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Empleados asociados */}
                  {oportunidad.evaluations.length > 0 && (
                    <div className="mt-4">
                      <span className="text-gray-400 text-sm">Empleados evaluados:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getUniqueEmployees(oportunidad.evaluations).map((empleado) => (
                          <span
                            key={empleado.id}
                            className="bg-gray-700 text-green-400 px-3 py-1 rounded-full text-sm"
                          >
                            {empleado.firstName} {empleado.lastName} ({empleado.employeeNo})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navegación */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Link
          href="/oportunidades/listado"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold text-center transition-colors"
        >
          Ver oportunidades abiertas
        </Link>
        <Link
          href="/dashboard"
          className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold text-center transition-colors"
        >
          Regresar al dashboard
        </Link>
      </div>
    </div>
  )
}