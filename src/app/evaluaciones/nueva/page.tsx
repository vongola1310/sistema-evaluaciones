'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'


const camposEvaluacion = [
  { key: 'updatedDate', label: 'Fecha actualizada' },
  { key: 'correctPriceQty', label: 'Precio y cantidad correctos' },
  { key: 'quoteUploaded', label: 'Cotización subida' },
  { key: 'description', label: 'Descripción' },
  { key: 'recentFollowUp', label: 'Seguimiento reciente' },
  { key: 'correctStage', label: 'Etapa correcta' },
  { key: 'realisticChance', label: 'Probabilidad realista' },
  { key: 'nextStepsDefined', label: 'Siguientes pasos definidos' },
  { key: 'contactAssigned', label: 'Contacto asignado' },
  { key: 'commentsUpdated', label: 'Comentarios actualizados' },
]

interface Employee {
  id: number
  fullName:string
}

interface Opportunity {
  id: number
  number: string
  name: string
}

export default function NuevaEvaluacion() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>('')
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session.user.role === 'evaluador') {
        try {
          const [empRes, oppRes] = await Promise.all([
            fetch('/api/empleados'),
            fetch('/api/oportunidades')
          ])

          if (!empRes.ok || !oppRes.ok) {
            throw new Error('Error al cargar datos')
          }

          const [empData, oppData] = await Promise.all([
            empRes.json(),
            oppRes.json()
          ])

          setEmployees(empData)
          setOpportunities(oppData)
          setIsLoading(false)

        } catch (error) {
          console.error('Error:', error)
          toast.error('Error al cargar datos necesarios')
          router.push('/dashboard')
        }
      }
    }

    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session.user.role !== 'evaluador') {
      router.push('/no-autorizado')
    } else {
      loadData()
    }
  }, [status, session, router])

  const handleChange = (campo: string, valor: string) => {
    setRespuestas(prev => ({ ...prev, [campo]: valor }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)

  try {
    // Validación básica
    if (!selectedEmployee || !selectedOpportunity) {
      throw new Error('Selecciona un empleado y una oportunidad')
    }

    // Convertir IDs a números
    const employeeId = parseInt(selectedEmployee)
    const opportunityId = parseInt(selectedOpportunity)

    // Validar conversión
    if (isNaN(employeeId) || isNaN(opportunityId)) {
      throw new Error('IDs de empleado u oportunidad inválidos')
    }

    // Obtener datos completos con validación
    const empleadoSeleccionado = employees.find(e => e.id === employeeId)
    const oportunidadSeleccionada = opportunities.find(o => o.id === opportunityId)

    if (!empleadoSeleccionado) {
      throw new Error('Empleado seleccionado no encontrado')
    }

    if (!oportunidadSeleccionada) {
      throw new Error('Oportunidad seleccionada no encontrada')
    }

    // Calcular puntuación
    let suma = 0
    let camposValidos = 0
    const respuestasNumericas: Record<string, string> = {}

    camposEvaluacion.forEach(({ key }) => {
      const val = respuestas[key] || '0'
      respuestasNumericas[key] = val
      
      if (val !== 'N/A') {
        suma += parseInt(val)
        camposValidos++
      }
    })

    const scoreRaw = suma
    const scoreAverage = camposValidos > 0 ? (suma / (camposValidos * 2)) * 100 : 0

    // Mostrar carga
    const loadingToast = toast.loading('Guardando evaluación...')

    // Enviar datos al backend
    const res = await fetch('/api/evaluaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId,
        opportunityId,
        ...respuestasNumericas,
        scoreRaw,
        scoreAverage
      })
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.error || 'Error al guardar evaluación')
    }

    // Éxito - Redirigir con parámetros de consulta
    const params = new URLSearchParams({
      success: '1',
      employee: `${empleadoSeleccionado.fullName}`,
      opportunity: `${oportunidadSeleccionada.number} - ${oportunidadSeleccionada.name}`
    })

    router.push(`/evaluaciones/resumen/${result.data.id}`)
    toast.success('Evaluación guardada correctamente', { id: loadingToast })

  } catch (error) {
    console.error('Error:', error)
    toast.error(
      error instanceof Error ? error.message : 'Error desconocido al guardar',
      { duration: 5000 }
    )
  } finally {
    setIsSubmitting(false)
  }
}

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Cargando datos...</p>
          <p className="text-sm text-gray-400 mt-2">Por favor espere</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Nueva Evaluación</h2>

        {/* Selectores de Empleado y Oportunidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Empleado:</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Seleccione un empleado</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id.toString()}>
                  {emp.fullName} 
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Oportunidad:</label>
            <select
              value={selectedOpportunity}
              onChange={(e) => setSelectedOpportunity(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Seleccione una oportunidad</option>
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.number} - {opp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Campos de evaluación */}
        <div className="space-y-4 mb-6">
          {camposEvaluacion.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="block text-sm font-medium">{label}:</label>
              <select
                value={respuestas[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Seleccione una opción</option>
                <option value="0">0 - Incumplido</option>
                <option value="1">1 - Parcialmente cumplido</option>
                <option value="2">2 - Totalmente cumplido</option>
                <option value="N/A">N/A - No aplica</option>
              </select>
            </div>
          ))}
        </div>

        {/* Botón de enviar */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded font-bold transition duration-200 ${
            isSubmitting
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Evaluación'}
        </button>
      </form>
      <Link href="/dashboard" className="inline-block mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow">
  ← Regresar al Dashboard
</Link>

    </div>
  )
}