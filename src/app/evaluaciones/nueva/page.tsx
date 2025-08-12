'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import { UserCheck, FileText, Send, MessageSquare, ChevronLeft } from 'lucide-react'

// --- DATOS Y TIPOS (sin cambios) ---
const camposEvaluacion = [
  { key: 'updatedDate', label: '¿La fecha de cierre refleja una expectativa realista y está actualizada?' },
  { key: 'correctPriceQty', label: '¿Los productos/servicios, precios y cantidades coinciden con la cotización?' },
  { key: 'quoteUploaded', label: '¿Se ha cargado el documento PDF de la cotización?' },
  { key: 'description', label: '¿Contiene información clara del problema del cliente y la solución propuesta?' },
  { key: 'recentFollowUp', label: '¿Se registró una actividad reciente (últimos 5 días hábiles)?' },
  { key: 'correctStage', label: '¿La oportunidad está en la etapa del pipeline adecuada?' },
  { key: 'realisticChance', label: '¿El % de cierre refleja la realidad de la negociación?' },
  { key: 'nextStepsDefined', label: '¿Se han registrado tareas o actividades futuras claras?' },
  { key: 'contactAssigned', label: '¿Existe un contacto principal registrado con nombre, correo y teléfono?' },
  { key: 'commentsUpdated', label: '¿Hay comentarios o notas recientes de conversaciones o acuerdos?' },
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
  }
}

// --- SUB-COMPONENTES PARA EL DISEÑO ---

/**
 * FormSection: Un contenedor para cada paso del formulario, dándole estructura.
 */
const FormSection = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
  <div className="bg-gray-800/50 border border-white/10 rounded-xl shadow-lg">
    <div className="flex items-center gap-3 p-4 border-b border-white/10">
      <Icon className="text-green-400" size={20} />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="p-6 space-y-6">
      {children}
    </div>
  </div>
)

/**
 * EvaluationField: El nuevo campo de evaluación interactivo.
 */
const EvaluationField = ({ field, value, onValueChange, comment, onCommentChange }: any) => {
  const options = [
    { value: '0', label: 'Incumplido', color: 'red' },
    { value: '1', label: 'Parcial', color: 'yellow' },
    { value: '2', label: 'Cumplido', color: 'green' },
    { value: 'N/A', label: 'N/A', color: 'gray' },
  ]
  const [showComment, setShowComment] = useState(false);

  return (
    <div className="p-4 bg-gray-900/50 border border-transparent rounded-lg transition-all focus-within:border-green-500/50">
      <label className="block text-sm font-medium text-gray-300 mb-3">{field.label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onValueChange(field.key, opt.value)}
            className={`
              px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 border-2
              ${value === opt.value
                ? `bg-${opt.color}-500/20 border-${opt.color}-500 text-white`
                : 'bg-gray-700/50 border-transparent hover:border-gray-500 text-gray-400'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
        <button 
          type="button" 
          onClick={() => setShowComment(!showComment)}
          className="ml-auto text-gray-500 hover:text-white transition-colors"
          title="Añadir comentario"
        >
          <MessageSquare size={18} />
        </button>
      </div>
      {showComment && (
        <textarea
          placeholder="Comentario (opcional)"
          value={comment || ''}
          onChange={(e) => onCommentChange(field.key, e.target.value)}
          className="w-full bg-gray-800 p-2 rounded border border-gray-600 mt-3 text-sm text-gray-300 transition focus:border-green-500 focus:ring-0"
          rows={2}
        />
      )}
    </div>
  );
};


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

export default function NuevaEvaluacion() {
  // --- LÓGICA Y ESTADOS (sin cambios) ---
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
    // ...Toda tu lógica de carga de datos se mantiene aquí sin cambios...
    const loadData = async () => {
      if (status === 'authenticated' && session.user.role === 'evaluador') {
        try {
          const [empRes, oppRes] = await Promise.all([ fetch('/api/empleados'), fetch('/api/oportunidades') ])
          if (!empRes.ok || !oppRes.ok) throw new Error('Error al cargar datos')
          const [empData, oppData] = await Promise.all([ empRes.json(), oppRes.json() ])
          setEmployees(empData); setOpportunities(oppData); setIsLoading(false)
        } catch (error) {
          console.error('Error:', error); toast.error('Error al cargar datos necesarios'); router.push('/dashboard')
        }
      }
    };
    if (status === 'unauthenticated') router.push('/login')
    else if (status === 'authenticated' && session.user.role !== 'evaluador') router.push('/no-autorizado')
    else loadData()
  }, [status, session, router])

  const handleChange = (campo: string, valor: string) => setRespuestas(prev => ({ ...prev, [campo]: valor }))
  const handleCommentChange = (campo: string, valor: string) => setComentarios(prev => ({ ...prev, [campo]: valor }))

  const handleSubmit = async (e: FormEvent) => {
    // ...Toda tu lógica de envío de formulario se mantiene aquí sin cambios...
    e.preventDefault(); setIsSubmitting(true);
    try {
      if (!selectedEmployee || !selectedOpportunity) throw new Error('Selecciona un empleado y una oportunidad')
      const employeeId = parseInt(selectedEmployee); const opportunityId = parseInt(selectedOpportunity);
      if (isNaN(employeeId) || isNaN(opportunityId)) throw new Error('IDs inválidos')
      let suma = 0; let camposValidos = 0; const respuestasNumericas: Record<string, string> = {}
      camposEvaluacion.forEach(({ key }) => {
        const val = respuestas[key] || '0'; respuestasNumericas[key] = val;
        if (val !== 'N/A') { suma += parseInt(val); camposValidos++; }
      })
      const scoreRaw = suma;
      const loadingToast = toast.loading('Guardando evaluación...');
      const res = await fetch('/api/evaluaciones', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId, opportunityId, ...respuestasNumericas,
          ...Object.fromEntries(Object.entries(comentarios).map(([key, value]) => [`${key}Comment`, value])),
          scoreRaw,
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al guardar');
      router.push(`/evaluaciones/panel`);
      toast.success('Evaluación guardada', { id: loadingToast });
    } catch (error) {
      console.error('Error:', error); toast.error(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const oportunidadesFiltradas = opportunities.filter(opp => opp.employee?.id === Number(selectedEmployee) && opp.state !== 'cerrada')

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-xl">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors w-fit">
              <ChevronLeft size={16} />
              Regresar al Dashboard
            </Link>
          <h1 className="text-4xl font-bold tracking-tight text-white mt-2">Nueva Evaluación de Oportunidad</h1>
          <p className="text-lg text-gray-400 mt-2">Completa los siguientes pasos para registrar la evaluación.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection icon={UserCheck} title="Paso 1: Selección">
            <div>
              <label htmlFor="employee-select" className="block text-sm font-medium text-gray-300 mb-2">Empleado a Evaluar</label>
              <select id="employee-select" value={selectedEmployee}
                onChange={(e) => { setSelectedEmployee(e.target.value); setSelectedOpportunity('') }}
                required
                className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 text-white focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Seleccione un empleado</option>
                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
              </select>
            </div>
            
            {selectedEmployee && (
              <div>
                <label htmlFor="opportunity-select" className="block text-sm font-medium text-gray-300 mb-2">Oportunidad</label>
                <select id="opportunity-select" value={selectedOpportunity} onChange={(e) => setSelectedOpportunity(e.target.value)} required
                  className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 text-white focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                  disabled={oportunidadesFiltradas.length === 0}
                >
                  <option value="">{oportunidadesFiltradas.length > 0 ? 'Seleccione una oportunidad' : 'No hay oportunidades abiertas para este empleado'}</option>
                  {oportunidadesFiltradas.map((opp) => <option key={opp.id} value={opp.id}>{opp.number} - {opp.name}</option>)}
                </select>
              </div>
            )}
          </FormSection>

          <FormSection icon={FileText} title="Paso 2: Criterios de Evaluación">
            <div className="space-y-4">
              {camposEvaluacion.map((field) => (
                <EvaluationField
                  key={field.key}
                  field={field}
                  value={respuestas[field.key]}
                  onValueChange={handleChange}
                  comment={comentarios[field.key]}
                  onCommentChange={handleCommentChange}
                />
              ))}
            </div>
          </FormSection>

          <FormSection icon={Send} title="Paso 3: Finalizar">
            <button
              type="submit"
              disabled={isSubmitting || !selectedOpportunity}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : 'Guardar Evaluación'}
            </button>
          </FormSection>
        </form>
      </div>
    </MainLayout>
  )
}