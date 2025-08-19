// /api/evaluaciones/acumulado/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ✅ LÍNEA CLAVE: Asegura que esta ruta nunca sea cacheada por el servidor.
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const mes = searchParams.get('mes')
    const employeeId = searchParams.get('employeeId')

    const where: any = {}

    if (employeeId) {
      where.employeeId = parseInt(employeeId)
    }

    if (year) {
      const yearNum = parseInt(year)
      if (mes) {
        const mesNum = parseInt(mes)
        where.startDate = {
          gte: new Date(yearNum, mesNum - 1, 1),
          lt: new Date(yearNum, mesNum, 1),
        }
      } else {
        where.startDate = {
          gte: new Date(yearNum, 0, 1),
          lt: new Date(yearNum + 1, 0, 1),
        }
      }
    }

    const reports = await prisma.weeklyReport.findMany({
      where,
      include: {
        employee: true,
        _count: {
          select: { evaluations: true },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    })
    
    const resultados = reports.map(report => ({
      reportId: report.id,
      employee: {
        firstName: report.employee.firstName,
        lastName: report.employee.lastName,
        employeeNo: report.employee.employeeNo,
      },
      totalEvaluaciones: report._count.evaluations,
      totalScore: report.totalScore,
      totalPosibles: report.possibleScore,
      averageScore: report.averageScore,
      rubrica: report.rubrica,
      periodo: `${report.startDate.toLocaleDateString('es-MX')} - ${report.endDate.toLocaleDateString('es-MX')}`
    }))

    return NextResponse.json({ success: true, data: resultados })
  } catch (error) {
    console.error('Error en API acumulado:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}