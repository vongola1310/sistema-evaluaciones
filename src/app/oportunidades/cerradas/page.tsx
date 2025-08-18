'use client'

import { useEffect, useState, FC } from 'react'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import { toast } from 'react-hot-toast'
import { Archive, ChevronLeft, User, ListX, Trophy, ShieldX, Calendar, Clock } from 'lucide-react'

// --- INTERFAZ ACTUALIZADA ---
interface Opportunity {
  id: number
  number: string
  name: string
  state: 'ganada' | 'perdida' | 'abierta' // Estado más específico
  createdAt: string // Fecha de creación
  closedAt: string | null // Fecha de cierre (puede ser nulo)
  daysOpen: number | null // Días abierta (puede ser nulo)
  employee: {
    id: number
    firstName: string
    lastName: string
    employeeNo: string
  }
}

// --- SUB-COMPONENTES DE DISEÑO ---

/**
 * Tarjeta rediseñada para mostrar una oportunidad cerrada con todos los detalles.
 */
const ClosedOpportunityCard: FC<{ opportunity: Opportunity }> = ({ opportunity }) => {
    
    // Función para formatear las fechas
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }
    
    // Determinar el estilo del badge según el estado
    const isWon = opportunity.state === 'ganada';
    const badgeStyles = isWon
        ? 'bg-green-500/10 text-green-300 border-green-500/30'
        : 'bg-red-500/10 text-red-300 border-red-500/30';
    const BadgeIcon = isWon ? Trophy : ShieldX;

    return (
        <div className="bg-gray-800 border border-white/10 rounded-xl p-6 transition-all hover:bg-gray-800/80">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                        <span className="bg-gray-700 text-gray-400 text-xs font-mono px-2 py-1 rounded">
                            OPP-{opportunity.number}
                        </span>
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full border ${badgeStyles}`}>
                            <BadgeIcon size={12} />
                            {isWon ? 'Cerrada - Ganada' : 'Cerrada - Perdida'}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-300 mb-3">{opportunity.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User size={16} />
                        <span>{opportunity.employee.firstName} {opportunity.employee.lastName}</span>
                    </div>
                </div>
            </div>
            {/* Nueva sección con las fechas y duración */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={16} className="text-green-400"/>
                    <div>
                        <strong>Abierta:</strong> {formatDate(opportunity.createdAt)}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={16} className="text-red-400"/>
                    <div>
                        <strong>Cerrada:</strong> {formatDate(opportunity.closedAt)}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={16} className="text-yellow-400"/>
                    <div>
                        <strong>Duración:</strong> {opportunity.daysOpen ?? 'N/A'} días
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmptyState: FC = () => (
  <div className="text-center py-20 bg-gray-800/50 rounded-lg">
    <ListX className="mx-auto text-gray-600" size={48} />
    <h3 className="mt-4 text-lg font-semibold text-white">No hay oportunidades cerradas</h3>
    <p className="mt-1 text-sm text-gray-400">
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
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors w-fit mb-2">
            <ChevronLeft size={16} /> Regresar al Dashboard
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Historial de Oportunidades</h1>
            <p className="text-lg text-gray-400 mt-2">Consulta el archivo de oportunidades que ya han sido completadas.</p>
          </div>
        </div>
        
        {loading ? (
           <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
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