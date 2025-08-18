'use client'

import { useState, useEffect, FormEvent, FC, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import { CalendarRange, UserCheck, FileText, Send, MessageSquare, ChevronLeft, Info } from 'lucide-react'

// --- INTERFACES Y DATOS ---
const camposEvaluacion = [
  { key: 'updatedDate', label: '¿Fecha de cierre realista y actualizada?' },
  { key: 'correctPriceQty', label: '¿Productos/servicios, precios y cantidades correctos?' },
  { key: 'quoteUploaded', label: '¿Se ha cargado el PDF de la cotización?' },
  { key: 'description', label: '¿Descripción clara del problema y la solución?' },
  { key: 'recentFollowUp', label: '¿Actividad reciente registrada (últimos 5 días hábiles)?' },
  { key: 'correctStage', label: '¿Etapa del pipeline correcta?' },
  { key: 'realisticChance', label: '¿El % de cierre refleja la realidad?' },
  { key: 'nextStepsDefined', label: '¿Tareas o actividades futuras definidas?' },
  { key: 'contactAssigned', label: '¿Contacto principal registrado con datos completos?' },
  { key: 'commentsUpdated', label: '¿Comentarios recientes de acuerdos con el cliente?' },
]
interface Employee { id: number; fullName: string }
interface Opportunity { 
  id: number; 
  number: string; 
  name: string;
  employee: {
    id: number;
  }
}

// --- SUB-COMPONENTES DE DISEÑO ---
const FormSection: FC<{ icon: any, title: string, subtitle?: string, children: ReactNode }> = ({ icon: Icon, title, subtitle, children }) => ( <div className="bg-gray-800/50 border border-white/10 rounded-xl shadow-lg"> <div className="p-4 border-b border-white/10"> <div className="flex items-center gap-3"> <Icon className="text-green-400" size={20} /> <h3 className="text-lg font-semibold text-white">{title}</h3> </div> {subtitle && <p className="text-sm text-gray-400 mt-1 ml-9">{subtitle}</p>} </div> <div className="p-6 space-y-6">{children}</div> </div> );
const EvaluationField: FC<{ oppId: number, field: any, value: string, onValueChange: Function, comment: string, onCommentChange: Function }> = ({ oppId, field, value, onValueChange, comment, onCommentChange }) => { const options = [ { value: '0', label: 'Incumplido', color: 'red' }, { value: '1', label: 'Parcial', color: 'yellow' }, { value: '2', label: 'Cumplido', color: 'green' }, { value: 'N/A', label: 'N/A', color: 'gray' }, ]; const [showComment, setShowComment] = useState(!!comment); return ( <div className="p-3 bg-gray-900/50 rounded-md"> <label className="block text-sm text-gray-300 mb-2">{field.label}</label> <div className="flex flex-wrap items-center gap-2"> {options.map(opt => ( <button key={opt.value} type="button" onClick={() => onValueChange(oppId, field.key, opt.value)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 border-2 ${value === opt.value ? `bg-${opt.color}-500/20 border-${opt.color}-500 text-white` : 'bg-gray-700/50 border-transparent hover:border-gray-500 text-gray-400'}`}>{opt.label}</button> ))} <button type="button" onClick={() => setShowComment(!showComment)} className="ml-auto text-gray-500 hover:text-white transition-colors" title="Añadir comentario"><MessageSquare size={18} /></button> </div> {showComment && (<textarea placeholder="Comentario (opcional)" value={comment || ''} onChange={(e) => onCommentChange(oppId, field.key, e.target.value)} className="w-full bg-gray-800 p-2 rounded border border-gray-600 mt-3 text-sm" rows={2} />)} </div> ) };
const OpportunityEvaluationCard: FC<{ opportunity: Opportunity, children: ReactNode }> = ({ opportunity, children }) => { const [isOpen, setIsOpen] = useState(true); return ( <div className="bg-gray-800 border border-white/10 rounded-lg"> <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left"> <div className="font-semibold text-white">{opportunity.number} - {opportunity.name}</div> <ChevronLeft className={`text-gray-400 transition-transform duration-300 ${isOpen ? '-rotate-90' : ''}`} /> </button> {isOpen && ( <div className="p-4 border-t border-white/10 space-y-3">{children}</div> )} </div> ) };

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function NuevaEvaluacionSemanal() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [respuestas, setRespuestas] = useState<Record<string, Record<string, string>>>({})
  const [comentarios, setComentarios] = useState<Record<string, Record<string, string>>>({})
  
  useEffect(() => { const loadData = async () => { try { const [empRes, oppRes] = await Promise.all([fetch('/api/empleados'), fetch('/api/oportunidades?status=abierta')]); const [empData, oppData] = await Promise.all([empRes.json(), oppRes.json()]); setEmployees(empData); setOpportunities(oppData); } catch (error) { toast.error('Error al cargar datos necesarios'); } finally { setIsLoading(false) } }; if (status === 'authenticated') loadData(); if (status === 'unauthenticated') router.push('/login'); }, [status, router])

  const handleValueChange = (oppId: number, campo: string, valor: string) => { setRespuestas(prev => ({ ...prev, [oppId]: { ...prev[oppId], [campo]: valor } })) }
  const handleCommentChange = (oppId: number, campo: string, valor: string) => { setComentarios(prev => ({ ...prev, [oppId]: { ...prev[oppId], [campo]: valor } })) }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !selectedEmployee) {
      toast.error('Por favor, selecciona el período y un empleado.');
      return;
    }
    setIsSubmitting(true);
    const loadingToast = toast.loading('Procesando y guardando reporte semanal...');
    
    try {
      const employeeId = parseInt(selectedEmployee);
      const evaluatedOppIds = Object.keys(respuestas);
      if (evaluatedOppIds.length === 0) {
        throw new Error('Debes evaluar al menos una oportunidad.');
      }
      
      const evaluationsData = evaluatedOppIds.map(oppId => {
        const oppResponses = respuestas[oppId];
        let scoreRaw = 0; let questionsAnswered = 0;
        camposEvaluacion.forEach(field => {
          const value = oppResponses[field.key];
          if (value && value !== 'N/A') { scoreRaw += parseInt(value); questionsAnswered++; }
        });
        const possibleScore = questionsAnswered * 2;
        return { opportunityId: parseInt(oppId), scoreRaw, possibleScore, responses: oppResponses, comments: comentarios[oppId] || {}, };
      });

      const weeklyTotal = evaluationsData.reduce((acc, current) => { acc.totalScore += current.scoreRaw; acc.possibleScore += current.possibleScore; return acc; }, { totalScore: 0, possibleScore: 0 });
      const averageScore = weeklyTotal.possibleScore > 0 ? (weeklyTotal.totalScore / weeklyTotal.possibleScore) * 20 : 0;

      let rubrica = '';
      const roundedAverage = Math.round(averageScore);
      if (roundedAverage >= 18) rubrica = 'Excelente';
      else if (roundedAverage >= 15) rubrica = 'Bueno';
      else if (roundedAverage >= 12) rubrica = 'Necesita mejora';
      else rubrica = 'Bajo desempeño';

      const payload = { employeeId, startDate, endDate, ...weeklyTotal, averageScore, rubrica, evaluationsData };

      const res = await fetch('/api/evaluaciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const result = await res.json(); throw new Error(result.error || 'Error al guardar el reporte'); }
      
      // ✅ Invalidar la caché del panel ANTES de redirigir
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: 'weekly-reports' })
      });
      
      toast.success('Reporte semanal guardado correctamente', { id: loadingToast });
      router.push('/evaluaciones/panel');
    
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Un error inesperado ocurrió', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  }

  const oportunidadesFiltradas = opportunities.filter(opp => opp.employee?.id === Number(selectedEmployee));

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 w-fit"><ChevronLeft size={16} /> Regresar al Dashboard</Link>
          <h1 className="text-4xl font-bold tracking-tight text-white mt-2">Nuevo Reporte Semanal</h1>
          <p className="text-lg text-gray-400 mt-2">Selecciona un período, un empleado y evalúa sus oportunidades abiertas.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection icon={CalendarRange} title="Paso 1: Define el Período y Empleado">
            <div className='grid md:grid-cols-2 gap-6'>
              <div><label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">Fecha de Inicio</label><input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md border border-gray-600"/></div>
              <div><label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">Fecha de Fin</label><input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md border border-gray-600"/></div>
            </div>
            <div><label htmlFor="employee-select" className="block text-sm font-medium text-gray-300 mb-2">Empleado a Evaluar</label><select id="employee-select" value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md border border-gray-600"><option value="">Selecciona un empleado</option>{employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}</select></div>
          </FormSection>
          {selectedEmployee && (<FormSection icon={FileText} title="Paso 2: Evalúa las Oportunidades" subtitle={`${oportunidadesFiltradas.length} oportunidades abiertas encontradas`}>{oportunidadesFiltradas.length > 0 ? (<div className="space-y-4">{oportunidadesFiltradas.map(opp => (<OpportunityEvaluationCard key={opp.id} opportunity={opp}>{camposEvaluacion.map(field => (<EvaluationField key={field.key} oppId={opp.id} field={field} value={respuestas[opp.id]?.[field.key] || ''} onValueChange={handleValueChange} comment={comentarios[opp.id]?.[field.key] || ''} onCommentChange={handleCommentChange} />))}</OpportunityEvaluationCard>))}</div>) : (<div className="text-center text-gray-400 py-8">No hay oportunidades abiertas para evaluar para este empleado.</div>)}</FormSection>)}
          <FormSection icon={Send} title="Paso 3: Guardar Reporte">
             <div className="flex items-center gap-3 bg-blue-900/50 border border-blue-500/30 text-blue-300 text-sm p-4 rounded-lg"><Info size={24} /><span>Al guardar, se generará un reporte semanal consolidado. Asegúrate de haber completado todas las evaluaciones deseadas para este período.</span></div>
            <button type="submit" disabled={isSubmitting || !selectedEmployee} className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-bold text-white transition-all bg-green-600 hover:bg-green-700 disabled:bg-gray-600">{isSubmitting ? 'Guardando...' : 'Generar y Guardar Reporte Semanal'}</button>
          </FormSection>
        </form>
      </div>
    </MainLayout>
  )
}