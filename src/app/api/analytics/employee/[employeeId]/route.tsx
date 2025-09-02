// /src/app/api/analytics/employee/[employeeId]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { employeeId: string } }
) {
  try {
    const employeeId = parseInt(params.employeeId, 10);
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'ID de empleado inválido.' }, { status: 400 });
    }

    // --- Consulta 1: Datos para el Gráfico de Líneas (Evolución Semanal) ---
    const weeklyPerformance = await prisma.weeklyReport.findMany({
      where: { employeeId },
      orderBy: { endDate: 'asc' },
      select: {
        endDate: true,
        averageScore: true,
      },
    });

    const lineChartData = weeklyPerformance.map(report => ({
      date: new Date(report.endDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
      Puntaje: parseFloat(report.averageScore.toFixed(1)),
    }));

    // --- Consulta 2: Datos para el Gráfico de Radar (Desglose Mensual) ---
    const latestMonthlyEval = await prisma.commercialEvaluation.findFirst({
      where: { employeeId },
      orderBy: { evaluationDate: 'desc' },
    });

    const radarChartData = latestMonthlyEval ? [
        { subject: 'Meta Ventas', value: latestMonthlyEval.salesGoalPonderedScore || 0 },
        { subject: 'Actividad', value: latestMonthlyEval.activityPonderedScore || 0 },
        { subject: 'Creación Ops', value: latestMonthlyEval.creationPonderedScore || 0 },
        { subject: 'Conversión', value: latestMonthlyEval.conversionPonderedScore || 0 },
        { subject: 'CRM', value: latestMonthlyEval.crmPonderedScore || 0 },
    ] : [];

    // --- Consulta 3: Datos para el Gráfico de Pastel (Tasa de Cierre) ---
    const opportunityStats = await prisma.opportunity.groupBy({
      by: ['state'],
      where: {
        employeeId,
        state: { in: ['ganada', 'perdida'] },
      },
      _count: {
        state: true,
      },
    });

    const pieChartData = opportunityStats.map(stat => ({
        name: stat.state === 'ganada' ? 'Ganadas' : 'Perdidas',
        value: stat._count.state,
    }));

    // --- Consolidamos todos los datos en una sola respuesta ---
    const analyticsData = {
      lineChartData,
      radarChartData,
      pieChartData,
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error("Error fetching employee analytics:", error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}