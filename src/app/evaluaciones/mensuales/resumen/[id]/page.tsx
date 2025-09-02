'use client'

import { useState, useEffect, FC } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { ChevronLeft, FileDown, Calendar, User, Award, TrendingUp, Target, Activity, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// --- INTERFACES ---
interface ReportData {
    id: number;
    employee: { firstName: string; lastName: string; employeeNo?: string; };
    evaluationDate: string | Date;
    quarter: number;
    year: number;
    totalScore: number;
    rubrica: string;
    salesGoalObjective: number;
    salesGoalAchieved: number;
    salesGoalPonderedScore: number;
    activityObjective: number;
    activityAchieved: number;
    activityPonderedScore: number;
    creationObjective: number;
    creationAchieved: number;
    creationPonderedScore: number;
    conversionObjective: number;
    conversionAchieved: number;
    conversionPonderedScore: number;
    crmObjective: number;
    crmAchieved: number;
    crmPonderedScore: number;
    extraPoints: number | null;
    evaluator?: { name: string; };
}

interface CriterioConfig {
    key: string;
    name: string;
    description: string;
    isPercentage: boolean;
    isCurrency: boolean;
    unit: string;
    ponderacion: number;
    icon: React.ReactNode;
    tips: string[];
}

// --- CONFIGURACIÓN DE CRITERIOS ---
const CRITERIOS_CONFIG: Record<string, CriterioConfig> = {
    salesGoal: { key: 'salesGoal', name: '1. Cumplimiento de Meta de Ventas', description: '% de cumplimiento frente a cuota', isPercentage: true, isCurrency: false, unit: '%', ponderacion: 30, icon: <Target className="w-5 h-5 text-green-600" />, tips: [] },
    activity: { key: 'activity', name: '2. Actividad Comercial (Presencia)', description: 'Número de visitas y reuniones remotas documentadas', isPercentage: false, isCurrency: false, unit: ' visitas', ponderacion: 20, icon: <Activity className="w-5 h-5 text-blue-600" />, tips: [] },
    creation: { key: 'creation', name: '3. Creación de Oportunidades', description: 'Valor monetario de nuevas oportunidades creadas', isPercentage: false, isCurrency: true, unit: '$', ponderacion: 15, icon: <TrendingUp className="w-5 h-5 text-purple-600" />, tips: [] },
    conversion: { key: 'conversion', name: '4. Conversión de Oportunidades (HIT RATE)', description: 'Tasa de conversión de oportunidades en ventas cerradas', isPercentage: true, isCurrency: false, unit: '%', ponderacion: 20, icon: <Award className="w-5 h-5 text-orange-600" />, tips: [] },
    crm: { key: 'crm', name: '5. Seguimiento en CRM', description: 'Evaluación basada en la matriz de calidad de llenado del CRM', isPercentage: false, isCurrency: false, unit: ' puntos', ponderacion: 15, icon: <User className="w-5 h-5 text-indigo-600" />, tips: [] }
};

// --- IMPORTACIÓN DINÁMICA ---
const PDFDownloader = dynamic( () => import('@/components/CommercialPDFDownloader'), { ssr: false, loading: () => ( <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-500"><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div><span className="text-sm">Preparando descarga...</span></div> ) } );

// --- FUNCIONES AUXILIARES ---
const formatCurrency = (value: number): string => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
const formatNumber = (value: number, decimals: number = 0): string => new Intl.NumberFormat('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value || 0);
const formatDate = (dateString: string | Date): string => new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateString));
const getPerformanceColor = (percentage: number): string => { if (percentage >= 100) return 'text-green-600 bg-green-50'; if (percentage >= 80) return 'text-blue-600 bg-blue-50'; if (percentage >= 60) return 'text-yellow-600 bg-yellow-50'; return 'text-red-600 bg-red-50'; };
const getRubricaColor = (rubrica: string): string => { if (rubrica.toLowerCase().includes('excelente')) return 'text-green-700 bg-green-100'; if (rubrica.toLowerCase().includes('aceptable')) return 'text-blue-700 bg-blue-100'; if (rubrica.toLowerCase().includes('mejorar')) return 'text-yellow-700 bg-yellow-100'; if (rubrica.toLowerCase().includes('bajo')) return 'text-orange-700 bg-orange-100'; return 'text-red-700 bg-red-100'; };

// --- COMPONENTES DE DISEÑO ---
const SummaryCard: FC<{ report: ReportData }> = ({ report }) => {
    const completionPercentage = ((report.totalScore || 0) / 100) * 100;
    const monthName = new Date(report.evaluationDate).toLocaleString('es-MX', { month: 'long' });
    
    return (
        <div className="bg-gradient-to-r from-brand-green to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                        {report.employee.firstName} {report.employee.lastName}
                    </h2>
                    <div className="flex items-center gap-4 text-green-100 mb-4">
                        <div className="flex items-center gap-2 capitalize">
                            <Calendar className="w-4 h-4" />
                            <span>{monthName} (Q{report.quarter}) {report.year}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{report.employee.employeeNo || 'N/A'}</span>
                        </div>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRubricaColor(report.rubrica || 'Sin evaluación')} bg-opacity-80`}>
                        {report.rubrica || 'Sin evaluación'}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold mb-1">
                        {formatNumber(report.totalScore || 0, 2)}
                    </div>
                    <div className="text-green-100">de 100 puntos</div>
                    <div className="mt-2">
                        <div className="w-24 h-2 bg-green-400 bg-opacity-30 rounded-full">
                            <div 
                                className="h-full bg-white rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                            />
                        </div>
                        <div className="text-xs text-green-100 mt-1">
                            {formatNumber(completionPercentage, 1)}% completado
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickMetrics: FC<{ report: ReportData }> = ({ report }) => {
    const monthNameShort = new Date(report.evaluationDate).toLocaleString('es-MX', { month: 'short' });
    const metrics = [
        { label: 'Criterios Evaluados', value: '5', icon: <Target className="w-6 h-6" />, color: 'bg-blue-500' },
        { label: 'Puntaje Base', value: formatNumber((report.totalScore || 0) - (report.extraPoints || 0), 2), icon: <TrendingUp className="w-6 h-6" />, color: 'bg-green-500' },
        { label: 'Puntos Extra', value: formatNumber(report.extraPoints || 0, 2), icon: <Award className="w-6 h-6" />, color: 'bg-purple-500' },
        { label: 'Período', value: `${monthNameShort.replace('.','')} (Q${report.quarter})`, icon: <Calendar className="w-6 h-6" />, color: 'bg-orange-500' }
    ];
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${metric.color} text-white`}>
                            {metric.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ReportDetailTable: FC<{ report: ReportData }> = ({ report }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Desglose Detallado por Criterios</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">Criterio de Evaluación</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">Descripción Completa</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Peso</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">Meta Establecida</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">Resultado Real</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[11%]">Puntaje Final</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {Object.values(CRITERIOS_CONFIG).map((criterio, index) => {
                            const objectiveKey = `${criterio.key}Objective` as keyof ReportData;
                            const achievedKey = `${criterio.key}Achieved` as keyof ReportData;
                            const ponderatedKey = `${criterio.key}PonderedScore` as keyof ReportData;
                            const objective = Number(report[objectiveKey]) || 0;
                            const achieved = Number(report[achievedKey]) || 0;
                            const pondered = Number(report[ponderatedKey]) || 0;
                            const percentage = objective > 0 ? (achieved / objective) * 100 : 0;
                            const isEvenRow = index % 2 === 0;
                            return (
                                <tr key={criterio.key} className={isEvenRow ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-3">
                                            <div>{criterio.icon}</div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900 leading-tight">{criterio.name}</div>
                                                <div className={`inline-flex items-center px-2 py-1 mt-2 text-xs rounded-full font-medium ${getPerformanceColor(percentage)}`}>
                                                    {formatNumber(percentage, 1)}% cumplimiento
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5"><p className="text-sm text-gray-600 leading-relaxed">{criterio.description}</p></td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="inline-flex items-center px-2 py-1 bg-brand-green bg-opacity-10 text-brand-green text-xs font-bold rounded">
                                            {criterio.ponderacion}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center"><div className="text-sm font-medium text-gray-900">{criterio.isCurrency ? formatCurrency(objective) : `${formatNumber(objective, 0)}${criterio.unit}`}</div></td>
                                    <td className="px-6 py-5 text-center"><div className="text-sm font-medium text-gray-900">{criterio.isCurrency ? formatCurrency(achieved) : `${formatNumber(achieved, 0)}${criterio.unit}`}</div></td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="text-lg font-bold text-brand-green">
                                            {formatNumber(pondered, 2)}%
                                        </div>
                                        <div className="text-xs text-gray-500">de {criterio.ponderacion}</div>
                                    </td>
                                </tr>
                            );
                        })}
                        {report.extraPoints != null && report.extraPoints > 0 && (
                            <tr className="bg-blue-50 border-t-2 border-blue-200">
                                <td className="px-6 py-5"><div className="flex items-start gap-3"><Award className="w-5 h-5 text-blue-600" /><div><div className="text-sm font-semibold text-blue-900">Puntos Extra Otorgados</div><div className="text-xs text-blue-700 mt-1">Reconocimiento especial</div></div></div></td>
                                <td className="px-6 py-5"><p className="text-sm text-blue-700">Evidencia de compromiso excepcional, valores corporativos, iniciativas o desempeño sobresaliente.</p></td>
                                <td className="px-6 py-5 text-center" colSpan={3}><div className="text-sm font-medium text-blue-900">{formatNumber(report.extraPoints, 1)} puntos</div></td>
                                <td className="px-6 py-5 text-center"><div className="text-lg font-bold text-blue-600">+{formatNumber(report.extraPoints, 2)}</div></td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="bg-gray-800 text-white">
                        <tr className="font-bold">
                            <td colSpan={5} className="px-6 py-4 text-right">
                                <div className="text-lg font-bold">PUNTUACIÓN TOTAL DE LA EVALUACIÓN:</div>
                                <div className="text-sm text-gray-300 mt-1">Evaluado el {formatDate(report.evaluationDate)}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="text-2xl font-bold text-brand-green">
                                    {formatNumber(report.totalScore || 0, 2)}%
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---
export default function ResumenEvaluacionMensualPage({ params }: { params: { id: string } }) {
    const [report, setReport] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => { const fetchDetails = async () => { setIsLoading(true); setError(null); try { const res = await fetch(`/api/evaluaciones-mensuales/${params.id}`); if (!res.ok) { throw new Error('Evaluación no encontrada'); } const data = await res.json(); setReport(data); } catch (err) { setError(err instanceof Error ? err.message : 'Error desconocido'); } finally { setIsLoading(false); } }; fetchDetails(); }, [params.id]);

    if (isLoading) { return ( <MainLayout><div className="max-w-6xl mx-auto p-4 sm:p-6"><div className="flex items-center justify-center py-20"><div className="text-center"><div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-600">Cargando evaluación...</p></div></div></div></MainLayout> ); }
    if (error || !report) { return ( <MainLayout><div className="max-w-6xl mx-auto p-4 sm:p-6"><div className="text-center py-20"><div className="text-red-600 text-6xl mb-4">⚠️</div><h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Evaluación no encontrada'}</h2><p className="text-gray-600 mb-6">No se pudo cargar la información de la evaluación solicitada.</p><Link href="/evaluaciones/mensuales/panel" className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"><ChevronLeft size={16} />Volver al Panel</Link></div></div></MainLayout> ); }

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link href="/evaluaciones/mensuales/panel" className="flex items-center gap-2 text-sm text-brand-green hover:text-green-700 w-fit mb-3 transition-colors"><ChevronLeft size={16} /> Volver al Panel de Evaluaciones</Link>
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">Reporte Detallado de Evaluación</h1>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <PDFDownloader report={report} />
                      
                    </div>
                </div>

                <SummaryCard report={report} />
                <QuickMetrics report={report} />
                <ReportDetailTable report={report} />

                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Fecha de evaluación:</span> {formatDate(report.evaluationDate)} • 
                        <span className="font-medium ml-2">Evaluador:</span> {report.evaluator?.name || 'N/A'}
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}