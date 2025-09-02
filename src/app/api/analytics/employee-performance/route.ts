import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: 'Se requiere el ID del empleado.' }, { status: 400 });
    }

    const numericEmployeeId = parseInt(employeeId, 10);

    // Buscamos todos los reportes semanales del empleado
    const reports = await prisma.weeklyReport.findMany({
      where: {
        employeeId: numericEmployeeId,
      },
      orderBy: {
        endDate: 'asc', // Ordenamos por fecha para que la línea del gráfico tenga sentido
      },
      select: {
        endDate: true,
        averageScore: true,
      },
    });

    // Formateamos los datos para que la gráfica los pueda usar fácilmente
    const chartData = reports.map(report => ({
      // Formateamos la fecha a un formato corto, ej: "25 Ago"
      date: new Date(report.endDate).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
      score: report.averageScore.toFixed(1),
    }));

    return NextResponse.json(chartData);

  } catch (error) {
    console.error("Error fetching performance data:", error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}