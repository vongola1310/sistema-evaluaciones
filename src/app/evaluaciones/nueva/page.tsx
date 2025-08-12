'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"

const camposEvaluacion = [
  { key: 'updatedDate', label: '¿La fecha de cierre refleja una expectativa realista y está actualizada conforme al ciclo de ventas?' },
  { key: 'correctPriceQty', label: '¿Los productos/servicios están registrados correctamente con precios y cantidades que coinciden con la cotización enviada?' },
  { key: 'quoteUploaded', label: '¿Se ha cargado el documento PDF o archivo correspondiente a la cotización enviada al cliente?' },
  { key: 'description', label: '¿Contiene información clara del problema del cliente, solución propuesta y contexto comercial?' },
  { key: 'recentFollowUp', label: '¿Se registró una actividad (llamada, correo, reunión, tarea) al menos 5 días hábiles antes de la revisión semanal?' },
  { key: 'correctStage', label: '¿La oportunidad está en la etapa del pipeline adecuada según su estado actual?' },
  { key: 'realisticChance', label: 'El % de cierre refleja la realidad de la negociación según el feedback del cliente y la etapa?' },
  { key: 'nextStepsDefined', label: '¿Se han registrado tareas o actividades futuras con fechas y responsables claros?' },
  { key: 'contactAssigned', label: '¿Existe un contacto principal registrado en la oportunidad con nombre, correo y teléfono?' },
  { key: 'commentsUpdated', label: '¿Hay comentarios o notas recientes de conversaciones o acuerdos con el cliente?' },
]

interface Employee {
  id: number
  fullName: string
}

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
  const [comentarios, setComentarios] = useState<Record<string, string>>({})

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
      if (!selectedEmployee || !selectedOpportunity) {
        throw new Error('Selecciona un empleado y una oportunidad')
      }

      const employeeId = parseInt(selectedEmployee)
      const opportunityId = parseInt(selectedOpportunity)

      if (isNaN(employeeId) || isNaN(opportunityId)) {
        throw new Error('IDs inválidos')
      }

      const empleadoSeleccionado = employees.find(e => e.id === employeeId)
      const oportunidadSeleccionada = opportunities.find(o => o.id === opportunityId)

      if (!empleadoSeleccionado) throw new Error('Empleado no encontrado')
      if (!oportunidadSeleccionada) throw new Error('Oportunidad no encontrada')

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

      const loadingToast = toast.loading('Guardando evaluación...')

      const res = await fetch('/api/evaluaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          opportunityId,
          ...respuestasNumericas,
          ...Object.fromEntries(
            Object.entries(comentarios).map(([key, value]) => [`${key}Comment`, value])
          ),
          scoreRaw,
          scoreAverage
        })
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Error al guardar evaluación')
      }

      router.push(`/evaluaciones/resumen/${result.data.id}`)
      toast.success('Evaluación guardada correctamente', { id: loadingToast })

    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const oportunidadesFiltradas = opportunities.filter(
    (opp) => opp.employee?.id === Number(selectedEmployee) && opp.state !== 'cerrada'
  )

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Nueva Evaluación</h2>

          {/* Select Empleado */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Empleado:</label>
            <select
              value={selectedEmployee}
              onChange={(e) => {
                setSelectedEmployee(e.target.value)
                setSelectedOpportunity('')
              }}
              required
              className="w-full bg-gray-700 p-2 rounded border border-gray-600"
            >
              <option value="">Seleccione un empleado</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id.toString()}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Select Oportunidad */}
          {selectedEmployee && (
            <div className="mb-4">
              <label className="block text-sm font-medium">
                Oportunidad:
                {oportunidadesFiltradas.length > 0 && (
                  <span className="ml-2 text-green-400 text-xs">● Oportunidades disponibles</span>
                )}
              </label>
              <select
                value={selectedOpportunity}
                onChange={(e) => setSelectedOpportunity(e.target.value)}
                required
                className="w-full bg-gray-700 p-2 rounded border border-gray-600"
              >
                <option value="">Seleccione una oportunidad</option>
                {oportunidadesFiltradas.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.number} - {opp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Campos evaluación */}
          <div className="space-y-4 mb-6">
            {camposEvaluacion.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium">{label}:</label>
                <select
                  value={respuestas[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  required
                  className="w-full bg-gray-700 p-2 rounded border border-gray-600"
                >
                  <option value="">Seleccione una opción</option>
                  <option value="0">0 - Incumplido</option>
                  <option value="1">1 - Parcialmente cumplido</option>
                  <option value="2">2 - Totalmente cumplido</option>
                  <option value="N/A">N/A - No aplica</option>
                </select>
                <textarea
                  placeholder="Comentario (opcional)"
                  value={comentarios[key] || ''}
                  onChange={(e) =>
                    setComentarios((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="w-full bg-gray-800 p-2 rounded border border-gray-600 mt-2 text-sm"
                  rows={2}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded font-bold ${isSubmitting
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
              }`}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Evaluación'}
          </button>
        </form>

        <Link
          href="/dashboard"
          className="inline-block mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow"
        >
          ← Regresar al Dashboard
        </Link>
      </div>
    </MainLayout>
  )
}
