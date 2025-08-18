'use client'

import { useEffect, useState, FC } from 'react'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import { toast } from 'react-hot-toast'
import { Plus, ChevronLeft, User, Filter, Lightbulb, LockKeyhole, Trophy, ShieldX, X } from 'lucide-react'

// --- INTERFAZ ---
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

// --- SUB-COMPONENTES DE DISEÑO (LIGHT MODE) ---

const LoadingState: FC = () => (
  <div className="flex flex-col items-center justify-center text-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
    <p className="mt-4 text-lg text-gray-600">Cargando oportunidades...</p>
  </div>
);

const EmptyState: FC = () => (
  <div className="text-center py-20 bg-brand-card rounded-lg border border-brand-border">
    <Lightbulb className="mx-auto text-gray-400" size={48} />
    <h3 className="mt-4 text-lg font-semibold text-brand-foreground">No hay oportunidades abiertas</h3>
    <p className="mt-1 text-sm text-gray-500">
      Parece que todo está al día. ¡Puedes crear una nueva oportunidad cuando lo necesites!
    </p>
    <Link
      href="/oportunidades/nueva"
      className="mt-6 inline-flex items-center gap-2 bg-brand-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
    >
      <Plus size={18} />
      Crear Oportunidad
    </Link>
  </div>
);

const CloseOpportunityModal: FC<{ 
    opportunity: Opportunity; 
    onClose: () => void; 
    onConfirm: (id: number, status: 'ganada' | 'perdida') => void;
    isSubmitting: boolean;
}> = ({ opportunity, onClose, onConfirm, isSubmitting }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
        <div className="bg-brand-background border border-brand-border rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-brand-foreground">Cerrar Oportunidad</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-brand-foreground"><X size={20}/></button>
            </div>
            <p className="text-sm text-gray-500 mb-2">Estás a punto de cerrar la oportunidad:</p>
            <p className="font-semibold text-brand-foreground mb-6">{opportunity.number} - {opportunity.name}</p>
            <p className="text-sm text-gray-500 mb-4">Por favor, selecciona el resultado final:</p>
            <div className="flex gap-4">
                <button 
                    onClick={() => onConfirm(opportunity.id, 'ganada')}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-green hover:bg-green-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400 transition-colors"
                >
                    <Trophy size={18}/>
                    <span>Ganada</span>
                </button>
                <button 
                    onClick={() => onConfirm(opportunity.id, 'perdida')}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400 transition-colors"
                >
                    <ShieldX size={18}/>
                    <span>Perdida</span>
                </button>
            </div>
        </div>
    </div>
);

const OpportunityCard: FC<{ opportunity: Opportunity; onOpenCloseModal: (opp: Opportunity) => void }> = ({ opportunity, onOpenCloseModal }) => (
  <div className="bg-brand-background border border-brand-border rounded-xl shadow-sm p-6 transition-all hover:border-brand-green hover:shadow-brand-green/20">
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div className="flex-grow">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-gray-100 text-gray-600 text-xs font-mono px-2 py-1 rounded">
            OPP-{opportunity.number}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-brand-green font-semibold">
            <div className="w-2 h-2 rounded-full bg-brand-green"></div>
            Abierta
          </span>
        </div>
        <h3 className="text-lg font-bold text-brand-foreground mb-2">{opportunity.name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <User size={16} />
          <span>{opportunity.employee.firstName} {opportunity.employee.lastName}</span>
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center">
        <button
          onClick={() => onOpenCloseModal(opportunity)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-semibold px-4 py-2 rounded-lg transition-colors"
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
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [opportunityToClose, setOpportunityToClose] = useState<Opportunity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/oportunidades?status=abierta', { cache: 'no-store' });
        if (!res.ok) throw new Error('Error al cargar oportunidades');
        const data = await res.json();
        setOpportunities(data);
      } catch (error) {
        console.error(error);
        toast.error('No se pudieron cargar las oportunidades');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [])

  const handleCerrarOportunidad = async (id: number, status: 'ganada' | 'perdida') => {
    setIsSubmitting(true);
    const toastId = toast.loading(`Cerrando oportunidad como ${status}...`);
    try {
      const res = await fetch(`/api/oportunidades/${id}/cerrar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Error al cerrar oportunidad');

      setOpportunities((prev) => prev.filter((opp) => opp.id !== id));
      setOpportunityToClose(null);
      toast.success('Oportunidad cerrada correctamente', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cerrar la oportunidad', { id: toastId });
    } finally {
        setIsSubmitting(false);
    }
  }

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
  );

  const filteredOpportunities = selectedEmployee
    ? opportunities.filter((opp) => opp.employee.id.toString() === selectedEmployee)
    : opportunities;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-brand-green hover:text-green-700 transition-colors w-fit mb-2">
            <ChevronLeft size={16} /> Regresar al Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-brand-foreground">Oportunidades Abiertas</h1>
              <p className="text-lg text-gray-600 mt-2">Gestiona y da seguimiento a las oportunidades activas.</p>
            </div>
            <Link href="/oportunidades/nueva" className="inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              <Plus size={18} />
              Crear Oportunidad
            </Link>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <label htmlFor="employee-filter" className="text-sm font-medium text-gray-700">Filtrar por empleado:</label>
          </div>
          <select
            id="employee-filter"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="mt-2 w-full md:max-w-xs bg-brand-background p-2 rounded-md border border-brand-border text-brand-foreground focus:ring-brand-green focus:border-brand-green"
          >
            <option value="">Todos los empleados</option>
            {empleadosUnicos.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.fullName}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-4">
            {filteredOpportunities.length === 0 ? (
              <EmptyState />
            ) : (
              filteredOpportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} onOpenCloseModal={setOpportunityToClose} />
              ))
            )}
          </div>
        )}
      </div>

      {opportunityToClose && (
        <CloseOpportunityModal 
            opportunity={opportunityToClose}
            onClose={() => setOpportunityToClose(null)}
            onConfirm={handleCerrarOportunidad}
            isSubmitting={isSubmitting}
        />
      )}
    </MainLayout>
  )
}