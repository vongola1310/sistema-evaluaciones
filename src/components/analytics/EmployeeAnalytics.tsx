'use client'

import { useState, useEffect, FC } from 'react';
import PerformanceLineChart from './PerformanceLineChart';
import PerformanceRadarChart from './PerformanceRadarChart';
import HitRatePieChart from './HitRatePieChart';

interface AnalyticsData {
    lineChartData: any[];
    radarChartData: any[];
    pieChartData: any[];
}

const ChartCard: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-brand-background border border-brand-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-brand-foreground mb-4">{title}</h3>
        {children}
    </div>
);

const EmployeeAnalytics: FC<{ employeeId: number }> = ({ employeeId }) => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/analytics/employee/${employeeId}`);
                if (res.ok) {
                    const data = await res.json();
                    setAnalyticsData(data);
                }
            } catch (error) {
                console.error("Failed to fetch analytics data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [employeeId]);

    if (isLoading) {
        return (
            <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto"></div>
                <p className="mt-4 text-gray-500">Cargando analíticas...</p>
            </div>
        );
    }

    if (!analyticsData) {
        return <div className="text-center text-red-500">No se pudieron cargar los datos de analíticas.</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2">
                <ChartCard title="Evolución de Desempeño Semanal (Puntaje 0-20)">
                    {analyticsData.lineChartData.length > 0 ? (
                        <PerformanceLineChart data={analyticsData.lineChartData} />
                    ) : (
                        <p className="text-gray-500 text-center py-10">No hay suficientes datos semanales para mostrar la evolución.</p>
                    )}
                </ChartCard>
            </div>
            <ChartCard title="Desglose de Última Evaluación Mensual">
                {analyticsData.radarChartData.length > 0 ? (
                    <PerformanceRadarChart data={analyticsData.radarChartData} />
                ) : (
                    <p className="text-gray-500 text-center py-10">No hay evaluaciones mensuales registradas.</p>
                )}
            </ChartCard>
            <ChartCard title="Tasa de Cierre de Oportunidades">
                {analyticsData.pieChartData.length > 0 ? (
                    <HitRatePieChart data={analyticsData.pieChartData} />
                ) : (
                    <p className="text-gray-500 text-center py-10">No hay oportunidades cerradas (ganadas/perdidas).</p>
                )}
            </ChartCard>
        </div>
    );
};

export default EmployeeAnalytics;