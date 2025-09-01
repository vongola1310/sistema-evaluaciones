'use client'

import { useState, useEffect, FC } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { ChevronLeft, FileDown } from 'lucide-react';
import dynamic from 'next/dynamic';

// --- INTERFACES ---
interface ReportData {
    id: number;
    employee: { firstName: string; lastName: string; };
    evaluationDate: string | Date;
    quarter: number;
    year: number;
    totalScore: number;
    salesGoalObjective: number; salesGoalAchieved: number; salesGoalPonderedScore: number;
    activityObjective: number; activityAchieved: number; activityPonderedScore: number;
    creationObjective: number; creationAchieved: number; creationPonderedScore: number;
    conversionObjective: number; conversionAchieved: number; conversionPonderedScore: number;
    crmObjective: number; crmAchieved: number; crmPonderedScore: number;
    extraPoints: number | null;
}

// --- IMPORTACIÓN DINÁMICA DEL BOTÓN DE PDF ---
const PDFDownloader = dynamic(
    () => import('@/components/CommercialPDFDownloader'),
    { 
        ssr: false,
        loading: () => <span className="text-xs text-gray-400">Cargando...</span> 
    }
);

// --- TABLA DE DESGLOSE ---
const ReportDetailTable: FC<{ report: ReportData }> = ({ report }) => {
    const PONDERACIONES = { salesGoal: 30, activity: 20, opportunityCreation: 15, opportunityConversion: 20, crmFollowUp: 15 };

    const formatCurrency = (value: number) => `$${(value || 0).toLocaleString('es-MX')}`;

    return (
        <div className="overflow-x-auto bg-brand-background border border-brand-border rounded-xl shadow-sm">
            <table className="w-full text-sm text-left text-gray-600">
                <thead className="bg-brand-card text-xs text-gray-700 uppercase">
                    <tr>
                        <th scope="col" className="px-6 py-3 font-bold">Criterio</th>
                        <th scope="col" className="px-6 py-3 text-center">Ponderación</th>
                        <th scope="col" className="px-6 py-3 text-center">Valor Objetivo</th>
                        <th scope="col" className="px-6 py-3 text-center">Resultado Obtenido</th>
                        <th scope="col" className="px-6 py-3 text-center font-bold">Resultado Ponderado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-brand-border"><th scope="row" className="px-6 py-4 font-bold text-brand-foreground">1. Cumplimiento de Meta</th><td className="px-6 py-4 text-center">{PONDERACIONES.salesGoal}%</td><td className="px-6 py-4 text-center">{report.salesGoalObjective}%</td><td className="px-6 py-4 text-center">{report.salesGoalAchieved}%</td><td className="px-6 py-4 text-center font-bold text-brand-foreground">{(report.salesGoalPonderedScore || 0).toFixed(2)}</td></tr>
                    <tr className="border-b border-brand-border bg-brand-card"><th scope="row" className="px-6 py-4 font-bold text-brand-foreground">2. Actividad Comercial</th><td className="px-6 py-4 text-center">{PONDERACIONES.activity}</td><td className="px-6 py-4 text-center">{report.activityObjective}</td><td className="px-6 py-4 text-center">{report.activityAchieved}</td><td className="px-6 py-4 text-center font-bold text-brand-foreground">{(report.activityPonderedScore || 0).toFixed(2)}</td></tr>
                    <tr className="border-b border-brand-border"><th scope="row" className="px-6 py-4 font-bold text-brand-foreground">3. Creación de Oportunidades</th><td className="px-6 py-4 text-center">{PONDERACIONES.opportunityCreation}</td><td className="px-6 py-4 text-center">{formatCurrency(report.creationObjective)}</td><td className="px-6 py-4 text-center">{formatCurrency(report.creationAchieved)}</td><td className="px-6 py-4 text-center font-bold text-brand-foreground">{(report.creationPonderedScore || 0).toFixed(2)}</td></tr>
                    <tr className="border-b border-brand-border bg-brand-card"><th scope="row" className="px-6 py-4 font-bold text-brand-foreground">4. Conversión de Oportunidades</th><td className="px-6 py-4 text-center">{PONDERACIONES.opportunityConversion}%</td><td className="px-6 py-4 text-center">{report.conversionObjective}%</td><td className="px-6 py-4 text-center">{report.conversionAchieved}%</td><td className="px-6 py-4 text-center font-bold text-brand-foreground">{(report.conversionPonderedScore || 0).toFixed(2)}</td></tr>
                    <tr className="border-b border-brand-border"><th scope="row" className="px-6 py-4 font-bold text-brand-foreground">5. Seguimiento en CRM</th><td className="px-6 py-4 text-center">{PONDERACIONES.crmFollowUp}</td><td className="px-6 py-4 text-center">{report.crmObjective}</td><td className="px-6 py-4 text-center">{report.crmAchieved}</td><td className="px-6 py-4 text-center font-bold text-brand-foreground">{(report.crmPonderedScore || 0).toFixed(2)}</td></tr>
                    {report.extraPoints != null && (<tr className="border-b border-brand-border bg-brand-card"><th scope="row" className="px-6 py-4 font-bold text-brand-foreground">+ Puntos Extra</th><td className="px-6 py-4 text-center">N/A</td><td className="px-6 py-4 text-center">N/A</td><td className="px-6 py-4 text-center">{report.extraPoints}</td><td className="px-6 py-4 text-center font-bold text-brand-foreground">{(report.extraPoints || 0).toFixed(2)}</td></tr>)}
                </tbody>
                <tfoot>
                    <tr className="font-bold text-brand-foreground">
                        <th scope="row" colSpan={4} className="px-6 py-3 text-right text-lg">TOTAL DE EVALUACIÓN</th>
                        <td className="px-6 py-3 text-center text-lg text-brand-green">{(report.totalScore || 0).toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---
export default function ResumenEvaluacionMensualPage({ params }: { params: { id: string } }) {
    const [report, setReport] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            const res = await fetch(`/api/evaluaciones-mensuales/${params.id}`);
            if(res.ok) setReport(await res.json());
            setIsLoading(false);
        }
        fetchDetails();
    }, [params.id]);

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto p-4 sm:p-6">
                {isLoading ? (
                    <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div></div>
                ) : !report ? (
                    <div className="text-center text-red-600">Reporte no encontrado.</div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <Link href="/evaluaciones/mensuales/panel" className="flex items-center gap-2 text-sm text-brand-green hover:text-green-700 w-fit mb-2">
                                    <ChevronLeft size={16} /> Volver al Panel
                                </Link>
                                <h1 className="text-4xl font-bold tracking-tight text-brand-foreground">
                                    Resumen de Evaluación Mensual
                                </h1>
                                <p className="text-lg text-gray-600 mt-1">{report.employee.firstName} {report.employee.lastName} - Q{report.quarter} {report.year}</p>
                            </div>
                            <PDFDownloader report={report} />
                        </div>
                        
                        <ReportDetailTable report={report} />
                    </>
                )}
            </div>
        </MainLayout>
    )
}