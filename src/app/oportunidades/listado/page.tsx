'use client'

import { useEffect, useState, FC } from 'react'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import { toast } from 'react-hot-toast'
import { Plus, ChevronLeft, User, Filter, Lightbulb, LockKeyhole } from 'lucide-react'

// --- INTERFACES Y DATOS (sin cambios) ---
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

// --- SUB-COMPONENTES PARA EL DISEÑO ---

/**
 * LoadingState: Un componente visual para el estado de carga.
 */
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center text-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
    <p className="mt-4 text-lg text-gray-300">Cargando oportunidades...</p>
  </div>
);

/**
 * EmptyState: Un componente para cuando no hay oportunidades que mostrar.
 */
const EmptyState = () => (
  <div className="text-center py-20 bg-gray-800/50 rounded-lg">
    <Lightbulb className="mx-auto text-gray-600" size={48} />
    <h3 className="mt-4 text-lg font-semibold text-white">No hay oportunidades abiertas</h3>
    <p className="mt-1 text-sm text-gray-400">
      Parece que todo está al día. ¡Puedes crear una nueva oportunidad cuando lo necesites!
    </p>
    <Link
      href="/oportunidades/nueva"
      className="mt-6 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
    >
      <Plus size={18} />
      Crear Oportunidad
    </Link>
  </div>
);

/**
 * OpportunityCard: La tarjeta que muestra la información de cada oportunidad.
 */
const OpportunityCard: FC<{ opportunity: Opportunity; onClose: (id: number) => void }> = ({ opportunity, onClose }) => (
  <div className="bg-gray-800 border border-white/10 rounded-xl shadow-lg p-6 transition-all hover:border-green-500/30 hover:shadow-green-500/5">
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      {/* Información principal */}
      <div className="flex-grow">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-gray-700 text-gray-300 text-xs font-mono px-2 py-1 rounded">
            OPP-{opportunity.number}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            Abierta
          </span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{opportunity.name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <User size={16} />
          <span>{opportunity.employee.firstName} {opportunity.employee.lastName}</span>
        </div>
      </div>
      {/* Área de Acción */}
      <div className="flex-shrink-0 flex sm:flex-col items-center justify-end gap-3">
        <button
          onClick={() => onClose(opportunity.id)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <LockKeyhole size={16} />
          <span>Cerrar</span>
        </button>
      </div>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

export default function ListadoOportunidades() {
  // --- LÓGICA Y ESTADOS (sin cambios) ---
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState('')

  const fetchData = async () => { /* Tu lógica aquí */ 
    try {
      const res = await fetch('/api/oportunidades'); if (!res.ok) throw new Error('Error');
      const data = await res.json(); setOpportunities(data.filter((opp: Opportunity) => opp.state !== 'cerrada'));
    } catch (error) { console.error(error); toast.error('No se pudieron cargar'); } 
    finally { setLoading(false); }
  }
  const cerrarOportunidad = async (id: number) => { /* Tu lógica aquí */
    if (!confirm('¿Seguro que deseas cerrar esta oportunidad?')) return;
    try {
      const res = await fetch(`/api/oportunidades/${id}/cerrar`, { method: 'PATCH' }); if (!res.ok) throw new Error('Error');
      setOpportunities((prev) => prev.filter((opp) => opp.id !== id)); toast.success('Oportunidad cerrada');
    } catch (error) { console.error(error); toast.error('No se pudo cerrar'); }
  }
  useEffect(() => { fetchData() }, [])
  const empleadosUnicos = Array.from(new Map(opportunities.map((opp) => [opp.employee.id, { id: opp.employee.id, fullName: `${opp.employee.firstName} ${opp.employee.lastName} (${opp.employee.employeeNo})` }])).values());
  const filteredOpportunities = selectedEmployee ? opportunities.filter((opp) => opp.employee.id.toString() === selectedEmployee) : opportunities;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Encabezado */}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors w-fit mb-2">
            <ChevronLeft size={16} /> Regresar al Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">Oportunidades Abiertas</h1>
              <p className="text-lg text-gray-400 mt-2">Gestiona y da seguimiento a las oportunidades activas.</p>
            </div>
            <Link href="/oportunidades/nueva" className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              <Plus size={18} />
              Crear Oportunidad
            </Link>
          </div>
        </div>
        
        {/* Barra de Herramientas (Filtro) */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <label htmlFor="employee-filter" className="text-sm font-medium text-gray-300">Filtrar por empleado:</label>
          </div>
          <select
            id="employee-filter"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="mt-2 w-full md:max-w-xs bg-gray-700 p-2 rounded-md border border-gray-600 text-white focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todos los empleados</option>
            {empleadosUnicos.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.fullName}</option>
            ))}
          </select>
        </div>

        {/* Contenido Principal */}
        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-4">
            {filteredOpportunities.length === 0 ? (
              <EmptyState />
            ) : (
              filteredOpportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} onClose={cerrarOportunidad} />
              ))
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}