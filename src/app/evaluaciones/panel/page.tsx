'use client'

import { useEffect, useState, FC, ReactNode } from 'react'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import { SlidersHorizontal, BarChart, User, CalendarDays, Percent, Star, ChevronLeft } from 'lucide-react'

// --- INTERFACES Y DATOS (sin cambios) ---
interface Acumulado {
  employee: {
    firstName: string
    lastName: string
    employeeNo: string
  }
  totalEvaluaciones: number
  totalScore: number
  totalPosibles: number
  porcentaje: string
  rubrica: string
  year: number
  trimestre: number
}

// --- SUB-COMPONENTES PARA EL DISEÑO ---

/**
 * CircularProgressBar: Un componente visual para el porcentaje de cumplimiento.
 */
const CircularProgressBar: FC<{ percentage: number }> = ({ percentage }) => {
  const sqSize = 100;
  const strokeWidth = 10;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - dashArray * percentage / 100;

  let colorClass = 'text-green-400';
  if (percentage < 70) colorClass = 'text-yellow-400';
  if (percentage < 40) colorClass = 'text-red-400';

  return (
    <div className="relative w-24 h-24">
      <svg width={sqSize} height={sqSize} viewBox={viewBox} className="transform -rotate-90">
        <circle
          className="text-gray-700"
          cx={sqSize / 2} cy={sqSize / 2} r={radius}
          strokeWidth={`${strokeWidth}px`} stroke="currentColor" fill="transparent"
        />
        <circle
          className={`${colorClass} transition-all duration-500`}
          cx={sqSize / 2} cy={sqSize / 2} r={radius}
          strokeWidth={`${strokeWidth}px`} stroke="currentColor" fill="transparent"
          strokeDasharray={dashArray} strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xl font-bold ${colorClass.replace('text-', 'text-')}`}>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

/**
 * StatCard: Una tarjeta pequeña para mostrar métricas individuales.
 */
const StatCard: FC<{ icon: any, label: string, value: string | number }> = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-800/50 p-3 rounded-lg flex items-center gap-3">
    <div className="bg-gray-700 p-2 rounded-md">
      <Icon className="text-gray-400" size={16} />
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  </div>
);

/**
 * EmployeeReportCard: La tarjeta principal que muestra el resumen de un empleado.
 */
const EmployeeReportCard: FC<{ data: Acumulado, periodo: string }> = ({ data, periodo }) => {
  const getRubricaColor = (rubrica: string) => {
    switch (rubrica.toLowerCase()) {
      case 'excelente': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'bueno': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'regular': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'insuficiente': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gray-800 border border-white/10 rounded-xl shadow-lg flex flex-col md:flex-row items-center p-6 gap-6">
      <div className="flex-shrink-0">
        <CircularProgressBar percentage={parseFloat(data.porcentaje)} />
      </div>
      <div className="flex-grow w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <p className="text-sm text-gray-400">{data.employee.employeeNo}</p>
            <h3 className="text-xl font-bold text-white">
              {data.employee.firstName} {data.employee.lastName}
            </h3>
          </div>
          <span className={`mt-2 sm:mt-0 text-xs font-semibold px-2 py-1 rounded-full border ${getRubricaColor(data.rubrica)}`}>
            {data.rubrica}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <StatCard icon={BarChart} label="Evaluaciones" value={data.totalEvaluaciones} />
          <StatCard icon={Star} label="Aciertos" value={`${data.totalScore} / ${data.totalPosibles}`} />
          <StatCard icon={CalendarDays} label="Periodo" value={periodo} />
        </div>
        <Link
          href={`/evaluaciones/empleado/${data.employee.employeeNo}/${data.year}/${data.trimestre}`}
          className="text-sm font-semibold text-green-400 hover:text-green-300 transition-colors"
        >
          Ver Reporte Detallado →
        </Link>
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

export default function PanelAcumulado() {
  // --- LÓGICA Y ESTADOS (sin cambios) ---
  const [acumulados, setAcumulados] = useState<Acumulado[]>([])
  const [trimestreFiltro, setTrimestreFiltro] = useState<number | null>(null)
  const [yearFiltro, setYearFiltro] = useState<number | null>(new Date().getFullYear()) // Default al año actual
  const [mesFiltro, setMesFiltro] = useState<number | null>(null)
  const [fechaInicio, setFechaInicio] = useState<string>('')
  const [fechaFin, setFechaFin] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchAcumulado = async () => {
    // ... Tu lógica de fetch se mantiene sin cambios
    setIsLoading(true);
    const params = new URLSearchParams();
    if (fechaInicio && fechaFin) { params.append('fechaInicio', fechaInicio); params.append('fechaFin', fechaFin) }
    else if (mesFiltro && yearFiltro) { params.append('mes', String(mesFiltro)); params.append('year', String(yearFiltro)) }
    else if (trimestreFiltro && yearFiltro) { params.append('trimestre', String(trimestreFiltro)); params.append('year', String(yearFiltro)) }
    else if (yearFiltro) { params.append('year', String(yearFiltro)) }
    const res = await fetch(`/api/evaluaciones/acumulado?${params.toString()}`);
    const data = await res.json();
    if (res.ok) setAcumulados(data.data);
    setIsLoading(false);
  }

  useEffect(() => { fetchAcumulado() }, [trimestreFiltro, yearFiltro, mesFiltro, fechaInicio, fechaFin])

  const mostrarPeriodo = (e: Acumulado) => {
    // ... Tu lógica para mostrar periodo se mantiene sin cambios
    if (fechaInicio && fechaFin) return `Rango de Fechas`
    if (mesFiltro && yearFiltro) return `${new Date(yearFiltro, mesFiltro - 1).toLocaleString('es-MX', { month: 'long' })} ${yearFiltro}`
    if (trimestreFiltro && yearFiltro) return `Q${e.trimestre} ${e.year}`
    if (yearFiltro) return `Año ${yearFiltro}`
    return 'General'
  }

  const handleClearFilters = () => {
    setTrimestreFiltro(null);
    setYearFiltro(new Date().getFullYear());
    setMesFiltro(null);
    setFechaInicio('');
    setFechaFin('');
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Encabezado */}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors w-fit mb-2">
            <ChevronLeft size={16} /> Regresar al Dashboard
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-white">Panel de Rendimiento</h1>
          <p className="text-lg text-gray-400 mt-2">Analiza los resultados acumulados de las evaluaciones por empleado.</p>
        </div>

        {/* Panel de Filtros */}
        <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <SlidersHorizontal className="text-green-400" size={20} />
            <h2 className="text-lg font-semibold text-white">Filtros de Búsqueda</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtros aquí */}
            <select value={trimestreFiltro ?? ''} onChange={(e) => { setTrimestreFiltro(e.target.value ? Number(e.target.value) : null); setMesFiltro(null); setFechaInicio(''); setFechaFin('') }} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 text-white focus:ring-green-500 focus:border-green-500">
                <option value="">Por Trimestre</option>
                <option value="1">Q1</option><option value="2">Q2</option><option value="3">Q3</option><option value="4">Q4</option>
            </select>
            <select value={mesFiltro ?? ''} onChange={(e) => { setMesFiltro(e.target.value ? Number(e.target.value) : null); setTrimestreFiltro(null); setFechaInicio(''); setFechaFin('') }} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 text-white focus:ring-green-500 focus:border-green-500">
                <option value="">Por Mes</option>
                {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('es-MX', { month: 'long' })}</option>)}
            </select>
            <select value={yearFiltro ?? ''} onChange={(e) => setYearFiltro(e.target.value ? Number(e.target.value) : null)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 text-white focus:ring-green-500 focus:border-green-500">
                <option value="">Por Año</option>
                {Array.from({ length: 5 }, (_, i) => <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>)}
            </select>
            <button onClick={handleClearFilters} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">Limpiar Filtros</button>
          </div>
        </div>

        {/* Resultados */}
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {acumulados.length === 0 ? (
              <div className="text-center py-10 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400">No se encontraron resultados para los filtros seleccionados.</p>
              </div>
            ) : (
              acumulados.map((e, idx) => (
                <EmployeeReportCard key={idx} data={e} periodo={mostrarPeriodo(e)} />
              ))
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}