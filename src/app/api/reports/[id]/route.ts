// src/app/api/reports/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de reporte inválido' }, { status: 400 });
    }

    const report = await prisma.weeklyReport.findUnique({
      where: { id },
      include: {
        employee: true,
        evaluator: true,
        evaluations: {
          include: {
            opportunity: true,
          },
          orderBy: {
            opportunity: { number: 'asc' }
          }
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
    }

    // Adaptamos el objeto para que coincida con la interfaz `FullReport` del frontend
    const responseData = {
        ...report,
        periodo: `${report.startDate.toLocaleDateString('es-MX')} - ${report.endDate.toLocaleDateString('es-MX')}`
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`Error fetching report ${params.id}:`, error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}