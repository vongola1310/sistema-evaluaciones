'use client'

import { useEffect, useState, FC, ReactNode } from 'react'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import { SlidersHorizontal, BarChart, Star, CalendarDays, ChevronLeft, RotateCcw, X, CheckCircle, XCircle, MinusCircle, User, FileDown } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ReportePDFDocument } from '@/components/ReportePDFDocument'

// --- INTERFACES Y DATOS ---
interface Employee { 
  id: number;
  fullName: string;
}
interface Acumulado {
  reportId: number;
  employee: { 
    firstName: string
    lastName: string
    employeeNo: string
  }
  totalEvaluaciones: number;
  totalScore: number
  totalPosibles: number
  averageScore: number;
  rubrica: string
  periodo: string;
}
interface FullReport extends Acumulado {
    evaluator: { name: string | null };
    startDate: string;
    endDate: string;
    evaluations: {
        id: number;
        opportunity: { number: string; name: string; };
        scoreRaw: number;
        possibleScore: number;
        [key: string]: any;
    }[];
    possibleScore: number;
}
const camposEvaluacion = [
    { key: 'updatedDate', label: 'Fecha de cierre realista y actualizada' },
    { key: 'correctPriceQty', label: 'Productos/servicios, precios y cantidades correctos' },
    { key: 'quoteUploaded', label: 'PDF de la cotización cargado' },
    { key: 'description', label: 'Descripción clara del problema y la solución' },
    { key: 'recentFollowUp', label: 'Actividad reciente registrada' },
    { key: 'correctStage', label: 'Etapa del pipeline correcta' },
    { key: 'realisticChance', label: 'Porcentaje de cierre realista' },
    { key: 'nextStepsDefined', label: 'Tareas o actividades futuras definidas' },
    { key: 'contactAssigned', label: 'Contacto principal registrado' },
    { key: 'commentsUpdated', label: 'Comentarios recientes de acuerdos' },
];

// --- SUB-COMPONENTES PARA EL DISEÑO ---

const CircularProgressBar: FC<{ score: number; size?: 'small' | 'large' }> = ({ score, size = 'small' }) => {
    const sqSize = size === 'small' ? 100 : 120;
    const strokeWidth = size === 'small' ? 10 : 12;
    const radius = (sqSize - strokeWidth) / 2;
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    const percentage = score ? (score / 20) * 100 : 0;
    const dashArray = radius * Math.PI * 2;
    const dashOffset = dashArray - dashArray * percentage / 100;
    let colorClass = 'text-green-400';
    if (percentage < 75) colorClass = 'text-yellow-400';
    if (percentage < 60) colorClass = 'text-red-400';
    const textSize = size === 'small' ? 'text-xl' : 'text-2xl';

    return (
        <div className={`relative ${size === 'small' ? 'w-24 h-24' : 'w-32 h-32'}`}>
            <svg width={sqSize} height={sqSize} viewBox={viewBox} className="transform -rotate-90">
                <circle className="text-gray-700" cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} stroke="currentColor" fill="transparent" />
                <circle className={`${colorClass} transition-all duration-500`} cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} stroke="currentColor" fill="transparent" strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`${textSize} font-bold ${colorClass}`}>{(score || 0).toFixed(1)}<span className='text-sm font-light'>/20</span></span>
            </div>
        </div>
    );
};

const ScoreIcon: FC<{ score: string }> = ({ score }) => {
    if (score === '2') return <CheckCircle className="text-green-500" />;
    if (score === '1') return <MinusCircle className="text-yellow-500" />;
    if (score === '0') return <XCircle className="text-red-500" />;
    return <span className="text-gray-500 text-sm">N/A</span>;
};

const StatCard: FC<{ icon: any, label: string, value: string | number }> = ({ icon: Icon, label, value }) => ( 
    <div className="bg-gray-800/50 p-3 rounded-lg flex items-center gap-3"> 
        <div className="bg-gray-700 p-2 rounded-md"> <Icon className="text-gray-400" size={16} /> </div> 
        <div> 
            <p className="text-xs text-gray-400">{label}</p> 
            <p className="text-sm font-bold text-white">{value}</p> 
        </div> 
    </div> 
);

const getRubricaColor = (rubrica: string) => {
    switch (rubrica.toLowerCase()) {
      case 'excelente': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'bueno': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'necesita mejora': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'bajo desempeño': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
};

const ReportModal: FC<{ reportId: number; onClose: () => void }> = ({ reportId, onClose }) => {
    const [report, setReport] = useState<FullReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!reportId) return;
        const fetchReportDetails = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/reports/${reportId}`);
                const data = await res.json();
                if (res.ok) {
                    setReport(data);
                }
            } catch (error) {
                console.error("Error fetching report details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReportDetails();
    }, [reportId]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity">
            <div className="bg-gray-800 border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Reporte Semanal Detallado</h2>
                    <div className="flex items-center gap-4">
                        {!loading && report && (
                            <PDFDownloadLink
                                document={<ReportePDFDocument report={report} />}
                                fileName={`reporte-semanal-${report.employee.lastName}-${reportId}.pdf`}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-3 py-1.5 rounded-md transition-colors"
                            >
                                {({ loading }) =>
                                    loading ? 'Generando PDF...' : <><FileDown size={14}/><span>Descargar PDF</span></>
                                }
                            </PDFDownloadLink>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X /></button>
                    </div>
                </div>
                {loading ? (
                    <div className="flex-grow flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div></div>
                ) : !report ? (
                    <div className="flex-grow flex items-center justify-center text-red-400 p-6 text-center">No se pudieron cargar los detalles del reporte.</div>
                ) : (
                    <div className="flex-grow p-6 overflow-y-auto">
                        <div className="bg-gray-900/50 rounded-lg p-6 flex flex-col md:flex-row items-center gap-8 mb-8">
                            <CircularProgressBar score={report.averageScore} size="large" />
                            <div className="flex-grow w-full">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-400">Empleado: <span className="font-semibold text-white">{report.employee.firstName} {report.employee.lastName}</span></p>
                                        <p className="text-gray-400">Evaluador: <span className="font-semibold text-white">{report.evaluator.name}</span></p>
                                    </div>
                                    <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getRubricaColor(report.rubrica)}`}>{report.rubrica}</span>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4 border-t border-white/10 pt-4">
                                     <StatCard icon={CalendarDays} label="Periodo" value={`${new Date(report.startDate).toLocaleDateString('es-MX')} - ${new Date(report.endDate).toLocaleDateString('es-MX')}`} />
                                     <StatCard icon={BarChart} label="Ops. Evaluadas" value={report.evaluations.length} />
                                     <StatCard icon={Star} label="Puntaje Total" value={`${report.totalScore} / ${report.possibleScore}`} />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Desglose de Evaluaciones</h3>
                        <div className="space-y-4">
                           {report.evaluations.map(ev => (
                                <div key={ev.id} className="bg-gray-900/50 border border-white/10 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-white">{ev.opportunity.number} - {ev.opportunity.name}</h4>
                                        <p className="text-sm font-bold text-gray-300">Puntaje: <span className="text-green-400">{ev.scoreRaw} / {ev.possibleScore}</span></p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <tbody>
                                                {camposEvaluacion.map(campo => {
                                                    const value = ev[campo.key];
                                                    const commentKey = `${campo.key}Comment`;
                                                    const comment = ev[commentKey];
                                                    return (
                                                        <tr key={campo.key} className="border-b border-gray-700/50 last:border-b-0">
                                                            <td className="py-2 pr-4 text-gray-300">{campo.label}</td>
                                                            <td className="py-2 pr-4 w-24"><ScoreIcon score={value as string} /></td>
                                                            <td className="py-2 text-gray-400 italic text-xs">{comment || '-'}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                           ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const EmployeeReportCard: FC<{ data: Acumulado; onViewDetails: (id: number) => void }> = ({ data, onViewDetails }) => (
    <div className="bg-gray-800 border border-white/10 rounded-xl shadow-lg flex flex-col md:flex-row items-center p-6 gap-6 transition-all hover:border-green-500/30 hover:bg-gray-800/80">
      <div className="flex-shrink-0"> <CircularProgressBar score={data.averageScore} /> </div>
      <div className="flex-grow w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <p className="text-sm text-gray-400">{data.employee.employeeNo}</p>
            <h3 className="text-xl font-bold text-white">{data.employee.firstName} {data.employee.lastName}</h3>
          </div>
          <span className={`mt-2 sm:mt-0 text-xs font-semibold px-2 py-1 rounded-full border ${getRubricaColor(data.rubrica)}`}>{data.rubrica}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <StatCard icon={BarChart} label="Ops. Evaluadas" value={data.totalEvaluaciones} />
          <StatCard icon={Star} label="Puntaje Total" value={`${data.totalScore} / ${data.totalPosibles}`} />
          <StatCard icon={CalendarDays} label="Periodo" value={data.periodo} />
        </div>
        <button onClick={() => onViewDetails(data.reportId)} className="text-sm font-semibold text-green-400 hover:text-green-300"> Ver Reporte Semanal Detallado → </button>
      </div>
    </div>
);

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function PanelAcumulado() {
  const [acumulados, setAcumulados] = useState<Acumulado[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [yearFiltro, setYearFiltro] = useState<number | null>(new Date().getFullYear());
  const [mesFiltro, setMesFiltro] = useState<number | null>(null);
  const [employeeFiltro, setEmployeeFiltro] = useState<string>('');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/empleados');
            const data = await res.json();
            setEmployees(data);
        } catch (error) {
            console.error("No se pudo cargar la lista de empleados", error);
        }
    }

    const fetchAcumulado = async () => {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (yearFiltro) params.append('year', String(yearFiltro));
        if (mesFiltro) params.append('mes', String(mesFiltro));
        if (employeeFiltro) params.append('employeeId', employeeFiltro);

        const res = await fetch(`/api/evaluaciones/acumulado?${params.toString()}`, {
          next: {
            tags: ['weekly-reports']
          }
        });
        
        const result = await res.json();
        if (res.ok) { 
            setAcumulados(result.data); 
        } else {
            setAcumulados([]);
        }
        setIsLoading(false);
    }
    
    fetchEmployees();
    fetchAcumulado();
  }, [yearFiltro, mesFiltro, employeeFiltro]);

  const handleClearFilters = () => {
    setYearFiltro(new Date().getFullYear());
    setMesFiltro(null);
    setEmployeeFiltro('');
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors w-fit mb-2"> <ChevronLeft size={16} /> Regresar al Dashboard </Link>
            <h1 className="text-4xl font-bold tracking-tight text-white">Panel de Rendimiento</h1>
            <p className="text-lg text-gray-400 mt-2">Analiza los reportes semanales acumulados por empleado.</p>
        </div>
        
        <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div className='flex items-center gap-3'> <SlidersHorizontal className="text-green-400" size={20} /> <h2 className="text-lg font-semibold text-white">Filtros de Búsqueda</h2> </div>
                <button onClick={handleClearFilters} className="flex items-center gap-2 text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-3 rounded-md transition-colors"> <RotateCcw size={14}/> Limpiar Filtros </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select value={employeeFiltro} onChange={(e) => setEmployeeFiltro(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 text-white focus:ring-green-500 focus:border-green-500"> <option value="">Todos los Empleados</option> {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)} </select>
                <select value={mesFiltro ?? ''} onChange={(e) => setMesFiltro(e.target.value ? Number(e.target.value) : null)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 text-white focus:ring-green-500 focus:border-green-500"> <option value="">Todos los Meses</option> {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('es-MX', { month: 'long' })}</option>)} </select>
                <select value={yearFiltro ?? ''} onChange={(e) => setYearFiltro(e.target.value ? Number(e.target.value) : null)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 text-white focus:ring-green-500 focus:border-green-500"> <option value="">Todos los Años</option> {Array.from({ length: 5 }, (_, i) => <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>)} </select>
            </div>
        </div>
        
        {isLoading ? ( <div className="text-center py-10"> <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div> </div> ) : ( <div className="space-y-6"> {acumulados.length === 0 ? ( <div className="text-center py-16 bg-gray-800/50 rounded-lg"> <BarChart className="mx-auto text-gray-600" size={48} /> <h3 className="mt-4 text-lg font-semibold text-white">No se encontraron reportes</h3> <p className="mt-1 text-sm text-gray-400">Intenta ajustar los filtros o verifica si hay datos para el periodo seleccionado.</p> </div> ) : ( acumulados.map((report) => ( <EmployeeReportCard key={report.reportId} data={report} onViewDetails={setSelectedReportId} /> )) )} </div> )}
        
        {selectedReportId && ( <ReportModal reportId={selectedReportId} onClose={() => setSelectedReportId(null)} /> )}
      </div>
    </MainLayout>
  )
}