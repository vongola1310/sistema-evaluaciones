'use client'

import { useEffect, useState, FC } from 'react'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import { toast } from 'react-hot-toast'
import { Archive, ChevronLeft, User, ListX } from 'lucide-react'

// --- INTERFAZ (la misma que antes) ---
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

// --- SUB-COMPONENTES DE DISEÑO ---

/**
 * Tarjeta para mostrar una oportunidad ya cerrada.
 * Nota que no tiene un botón de acción, solo muestra la información.
 */
const ClosedOpportunityCard: FC<{ opportunity: Opportunity }> = ({ opportunity }) => (
  <div className="bg-gray-800 border border-white/10 rounded-xl p-6 opacity-70">
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div className="flex-grow">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-gray-700 text-gray-400 text-xs font-mono px-2 py-1 rounded">
            OPP-{opportunity.number}
          </span>
          {/* Badge de estado "Cerrada" */}
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <Archive size={12} />
            Cerrada
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-300 mb-2">{opportunity.name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <User size={16} />
          <span>{opportunity.employee.firstName} {opportunity.employee.lastName}</span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Componente para cuando no hay resultados.
 */
const EmptyState = () => (
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
      try {
        // ✅ ¡LA CLAVE ESTÁ AQUÍ! Llamamos a la API pidiendo solo las cerradas.
        const res = await fetch('/api/oportunidades?status=cerrada')
        if (!res.ok) throw new Error('Error al cargar oportunidades')
        
        const data = await res.json()
        // Ya no necesitamos filtrar en el cliente, el servidor lo hizo por nosotros.
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
        {/* Encabezado */}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors w-fit mb-2">
            <ChevronLeft size={16} /> Regresar al Dashboard
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Historial de Oportunidades</h1>
            <p className="text-lg text-gray-400 mt-2">Consulta el archivo de oportunidades que ya han sido completadas.</p>
          </div>
        </div>
        
        {/* Contenido Principal */}
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