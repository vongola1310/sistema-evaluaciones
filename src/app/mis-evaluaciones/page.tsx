'use client'

import { useEffect, useState, FC, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import { toast } from 'react-hot-toast'
import { BarChart, Star, CalendarDays, X, CheckCircle, XCircle, MinusCircle, FileDown, Award } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ReportePDFDocument } from '@/components/ReportePDFDocument'

// --- INTERFACES Y DATOS ---
interface Acumulado { reportId: number; employee: { firstName: string; lastName: string; employeeNo: string; }; totalEvaluaciones: number; totalScore: number; totalPosibles: number; averageScore: number; rubrica: string; periodo: string; }
interface FullReport extends Acumulado { evaluator: { name: string | null }; startDate: string; endDate: string; evaluations: { id: number; opportunity: { number: string; name: string; }; scoreRaw: number; possibleScore: number; [key: string]: any; }[]; possibleScore: number; }
const camposEvaluacion = [ { key: 'updatedDate', label: 'Fecha de cierre realista y actualizada' }, { key: 'correctPriceQty', label: 'Productos/servicios, precios y cantidades correctos' }, { key: 'quoteUploaded', label: 'PDF de la cotización cargado' }, { key: 'description', label: 'Descripción clara del problema y la solución' }, { key: 'recentFollowUp', label: 'Actividad reciente registrada' }, { key: 'correctStage', label: 'Etapa del pipeline correcta' }, { key: 'realisticChance', label: 'Porcentaje de cierre realista' }, { key: 'nextStepsDefined', label: 'Tareas o actividades futuras definidas' }, { key: 'contactAssigned', label: 'Contacto principal registrado' }, { key: 'commentsUpdated', label: 'Comentarios recientes de acuerdos' }, ];

// --- SUB-COMPONENTES DE DISEÑO (LIGHT MODE) ---

const CircularProgressBar: FC<{ score: number; size?: 'small' | 'large' }> = ({ score, size = 'small' }) => { const sqSize = size === 'small' ? 100 : 120; const strokeWidth = size === 'small' ? 10 : 12; const radius = (sqSize - strokeWidth) / 2; const viewBox = `0 0 ${sqSize} ${sqSize}`; const percentage = score ? (score / 20) * 100 : 0; const dashArray = radius * Math.PI * 2; const dashOffset = dashArray - dashArray * percentage / 100; let colorClass = 'text-brand-green'; if (percentage < 75) colorClass = 'text-yellow-500'; if (percentage < 60) colorClass = 'text-red-500'; const textSize = size === 'small' ? 'text-xl' : 'text-2xl'; return ( <div className={`relative ${size === 'small' ? 'w-24 h-24' : 'w-32 h-32'}`}> <svg width={sqSize} height={sqSize} viewBox={viewBox} className="transform -rotate-90"> <circle className="text-gray-200" cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} stroke="currentColor" fill="transparent" /> <circle className={`${colorClass} transition-all duration-500`} cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} stroke="currentColor" fill="transparent" strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="round" /> </svg> <div className="absolute inset-0 flex items-center justify-center"> <span className={`${textSize} font-bold ${colorClass}`}>{(score || 0).toFixed(1)}<span className='text-sm font-light text-gray-500'>/20</span></span> </div> </div> ); };
const ScoreIcon: FC<{ score: string }> = ({ score }) => { if (score === '2') return <CheckCircle className="text-green-500" />; if (score === '1') return <MinusCircle className="text-yellow-500" />; if (score === '0') return <XCircle className="text-red-500" />; return <span className="text-gray-500 text-sm">N/A</span>; };
const StatCard: FC<{ icon: any, label: string, value: string | number }> = ({ icon: Icon, label, value }) => ( <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3 border border-gray-200"> <div className="bg-gray-200 p-2 rounded-md"> <Icon className="text-gray-500" size={16} /> </div> <div> <p className="text-xs text-gray-500">{label}</p> <p className="text-sm font-bold text-brand-foreground">{value}</p> </div> </div> );
const getRubricaColor = (rubrica: string) => { switch (rubrica.toLowerCase()) { case 'excelente': return 'bg-green-100 text-green-800 border-green-200'; case 'bueno': return 'bg-cyan-100 text-cyan-800 border-cyan-200'; case 'necesita mejora': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; case 'bajo desempeño': return 'bg-red-100 text-red-800 border-red-200'; default: return 'bg-gray-100 text-gray-800 border-gray-200'; } };

const ReportModal: FC<{ reportId: number; onClose: () => void }> = ({ reportId, onClose }) => {
    const [report, setReport] = useState<FullReport | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => { if (!reportId) return; const fetchReportDetails = async () => { setLoading(true); try { const res = await fetch(`/api/reports/${reportId}`); const data = await res.json(); if (res.ok) { setReport(data); } } catch (error) { console.error("Error fetching report details", error); } finally { setLoading(false); } }; fetchReportDetails(); }, [reportId]);
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-brand-background border border-brand-border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-brand-border flex-shrink-0">
                    <h2 className="text-xl font-bold text-brand-foreground">Reporte Semanal Detallado</h2>
                    <div className="flex items-center gap-4">
                        {!loading && report && (
                            <PDFDownloadLink
                                document={<ReportePDFDocument report={report} />}
                                fileName={`reporte-semanal-${report.employee.lastName}-${reportId}.pdf`}
                                className="flex items-center gap-2 bg-brand-green hover:bg-green-700 text-white font-semibold text-xs px-3 py-1.5 rounded-md"
                            >
                                {/* ✅ CORRECCIÓN: Contenido estático para evitar el error de tipos */}
                                <>
                                    <FileDown size={14}/>
                                    <span>Descargar PDF</span>
                                </>
                            </PDFDownloadLink>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-brand-foreground"><X /></button>
                    </div>
                </div>
                {loading ? ( <div className="flex-grow flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div></div> ) : !report ? ( <div className="flex-grow flex items-center justify-center text-red-600 p-6 text-center">No se pudieron cargar los detalles.</div> ) : (
                    <div className="flex-grow p-6 overflow-y-auto">
                        <div className="bg-brand-card rounded-lg p-6 flex flex-col md:flex-row items-center gap-8 mb-8 border border-brand-border">
                            <CircularProgressBar score={report.averageScore} size="large" />
                            <div className="flex-grow w-full">
                                <div className="flex justify-between items-start">
                                    <div> <p className="text-gray-500">Evaluador: <span className="font-semibold text-brand-foreground">{report.evaluator.name}</span></p> <span className={`text-lg font-semibold px-3 py-1 rounded-full border ${getRubricaColor(report.rubrica)}`}>{report.rubrica}</span> </div>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4 border-t border-brand-border pt-4">
                                     <StatCard icon={CalendarDays} label="Periodo" value={`${new Date(report.startDate).toLocaleDateString('es-MX')} - ${new Date(report.endDate).toLocaleDateString('es-MX')}`} />
                                     <StatCard icon={BarChart} label="Ops. Evaluadas" value={report.evaluations.length} />
                                     <StatCard icon={Star} label="Puntaje Total" value={`${report.totalScore} / ${report.possibleScore}`} />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-4 text-brand-foreground">Desglose de Evaluaciones</h3>
                        <div className="space-y-4">
                           {report.evaluations.map(ev => (
                                <div key={ev.id} className="bg-brand-background border border-brand-border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3"> <h4 className="font-semibold text-brand-foreground">{ev.opportunity.number} - {ev.opportunity.name}</h4> <p className="text-sm font-bold text-gray-600">Puntaje: <span className="text-brand-green">{ev.scoreRaw} / {ev.possibleScore}</span></p> </div>
                                    <div className="overflow-x-auto"> <table className="w-full text-sm"> <tbody> {camposEvaluacion.map(campo => { const value = ev[campo.key]; const commentKey = `${campo.key}Comment`; const comment = ev[commentKey]; return ( <tr key={campo.key} className="border-b border-brand-border last:border-b-0"> <td className="py-2 pr-4 text-gray-600">{campo.label}</td> <td className="py-2 pr-4 w-24"><ScoreIcon score={value as string} /></td> <td className="py-2 text-gray-500 italic text-xs">{comment || '-'}</td> </tr> ) })} </tbody> </table> </div>
                                </div>
                           ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MyReportCard: FC<{ data: Acumulado; onViewDetails: (id: number) => void }> = ({ data, onViewDetails }) => (
    <div className="bg-brand-background border border-brand-border rounded-xl shadow-sm flex flex-col md:flex-row items-center p-6 gap-6 transition-all hover:border-brand-green hover:shadow-lg hover:shadow-brand-green/20">
      <div className="flex-shrink-0"> <CircularProgressBar score={data.averageScore} /> </div>
      <div className="flex-grow w-full">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-sm text-gray-500">Periodo de Evaluación</p>
                <h3 className="text-xl font-bold text-brand-foreground">{data.periodo}</h3>
            </div>
            <span className={`mt-2 sm:mt-0 text-xs font-semibold px-2 py-1 rounded-full border ${getRubricaColor(data.rubrica)}`}>{data.rubrica}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <StatCard icon={BarChart} label="Ops. Evaluadas" value={data.totalEvaluaciones} />
          <StatCard icon={Star} label="Puntaje Total" value={`${data.totalScore} / ${data.totalPosibles}`} />
        </div>
        <button onClick={() => onViewDetails(data.reportId)} className="text-sm font-semibold text-brand-green hover:text-green-700"> Ver Detalles del Reporte → </button>
      </div>
    </div>
);

// --- COMPONENTE PRINCIPAL DEL DASHBOARD DE EMPLEADO ---
export default function MisEvaluacionesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [reports, setReports] = useState<Acumulado[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
    
    useEffect(() => { if (status === 'unauthenticated') { router.push('/login'); } if (status === 'authenticated') { if (session.user.role === 'employee' && session.user.employeeId) { const fetchMyReports = async () => { setIsLoading(true); const employeeId = session.user.employeeId; const res = await fetch(`/api/evaluaciones/acumulado?employeeId=${employeeId}`, { cache: 'no-store', }); if(res.ok) { const data = await res.json(); setReports(data.data); } setIsLoading(false); }; fetchMyReports(); } else if (session.user.role !== 'employee') { router.push('/dashboard'); } else { setIsLoading(false); setReports([]); } } }, [status, session, router]);

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-brand-foreground">Mis Reportes de Rendimiento</h1>
                    <p className="text-lg text-gray-600 mt-2">Aquí puedes consultar el historial de tus evaluaciones semanales.</p>
                </div>
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando tus reportes...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-16 bg-brand-card rounded-lg border border-brand-border">
                        <Award className="mx-auto text-gray-400" size={48} />
                        <h3 className="mt-4 text-lg font-semibold text-brand-foreground">Aún no tienes reportes</h3>
                        <p className="mt-1 text-sm text-gray-500">Cuando un evaluador te envíe un reporte, aparecerá aquí.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reports.map((report) => (
                            <MyReportCard key={report.reportId} data={report} onViewDetails={setSelectedReportId} />
                        ))}
                    </div>
                )}
            </div>
            {selectedReportId && (
                <ReportModal reportId={selectedReportId} onClose={() => setSelectedReportId(null)} />
            )}
        </MainLayout>
    );
}