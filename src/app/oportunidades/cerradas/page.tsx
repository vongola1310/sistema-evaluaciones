'use client'

import { useEffect, useState, FC } from 'react'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import { toast } from 'react-hot-toast'
import { Archive, ChevronLeft, User, ListX, Trophy, ShieldX, Calendar, Clock } from 'lucide-react'

// --- INTERFAZ ---
interface Opportunity {
  id: number
  number: string
  name: string
  state: 'ganada' | 'perdida' | 'abierta'
  createdAt: string
  closedAt: string | null
  daysOpen: number | null
  employee: {
    id: number
    firstName: string
    lastName: string
    employeeNo: string
  }
}

// --- SUB-COMPONENTES DE DISEÑO (LIGHT MODE) ---

const ClosedOpportunityCard: FC<{ opportunity: Opportunity }> = ({ opportunity }) => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }
    
    const isWon = opportunity.state === 'ganada';
    const badgeStyles = isWon
        ? 'bg-green-100 text-green-800 border-green-200'
        : 'bg-red-100 text-red-800 border-red-200';
    const BadgeIcon = isWon ? Trophy : ShieldX;

    return (
        <div className="bg-brand-background border border-brand-border rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                        <span className="bg-gray-100 text-gray-600 text-xs font-mono px-2 py-1 rounded">
                            OPP-{opportunity.number}
                        </span>
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full border ${badgeStyles}`}>
                            <BadgeIcon size={12} />
                            {isWon ? 'Cerrada - Ganada' : 'Cerrada - Perdida'}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-brand-foreground mb-3">{opportunity.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User size={16} />
                        <span>{opportunity.employee.firstName} {opportunity.employee.lastName}</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={16} className="text-brand-green"/>
                    <div>
                        <strong>Abierta:</strong>
                        <span className="ml-1 font-medium text-brand-foreground">{formatDate(opportunity.createdAt)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={16} className="text-red-500"/>
                    <div>
                        <strong>Cerrada:</strong>
                        <span className="ml-1 font-medium text-brand-foreground">{formatDate(opportunity.closedAt)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    <Clock size={16} className="text-yellow-500"/>
                    <div>
                        <strong>Duración:</strong>
                        <span className="ml-1 font-medium text-brand-foreground">{opportunity.daysOpen ?? 'N/A'} días</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmptyState: FC = () => (
  <div className="text-center py-20 bg-brand-card rounded-lg border border-brand-border">
    <ListX className="mx-auto text-gray-400" size={48} />
    <h3 className="mt-4 text-lg font-semibold text-brand-foreground">No hay oportunidades cerradas</h3>
    <p className="mt-1 text-sm text-gray-500">
      Aún no se ha cerrado ninguna oportunidad en el sistema.
    </p>
  </div>
);

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

export default function ListadoOportunidadesCerradas() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/oportunidades?status=cerrada', { cache: 'no-store' })
        if (!res.ok) throw new Error('Error al cargar oportunidades')
        
        const data = await res.json()
        setOpportunities(data)
      } catch (error) {
        console.error(error)
        toast.error('No se pudieron cargar las oportunidades cerradas')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-brand-green hover:text-green-700 transition-colors w-fit mb-2">
            <ChevronLeft size={16} /> Regresar al Dashboard
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-brand-foreground">Historial de Oportunidades</h1>
            <p className="text-lg text-gray-600 mt-2">Consulta el archivo de oportunidades que ya han sido completadas.</p>
          </div>
        </div>
        
        {loading ? (
           <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
           </div>
        ) : (
          <div className="space-y-4">
            {opportunities.length === 0 ? (
              <EmptyState />
            ) : (
              opportunities.map((opp) => (
                <ClosedOpportunityCard key={opp.id} opportunity={opp} />
              ))
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}