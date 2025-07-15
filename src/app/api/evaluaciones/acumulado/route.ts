// app/api/evaluaciones/acumulado/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trimestre = searchParams.get('trimestre')
    const year = searchParams.get('year')

    const where: any = {}

    if (trimestre) {
      where.trimestre = Number(trimestre)
    }

    if (year) {
      where.year = Number(year)
    }

    const evaluaciones = await prisma.evaluation.findMany({
      where,
      include: {
        employee: true
      }
    })

    // Agrupar por employeeId
    const agrupadas = new Map()

    for (const evaluacion of evaluaciones) {
      const key = evaluacion.employeeId
      if (!agrupadas.has(key)) {
        agrupadas.set(key, {
          employee: evaluacion.employee,
          totalEvaluaciones: 0,
          totalScore: 0,
          totalPosibles: 0
        })
      }

      const empData = agrupadas.get(key)
      empData.totalEvaluaciones += 1
      empData.totalScore += evaluacion.scoreRaw
      empData.totalPosibles += evaluacion.totalPosibles
    }

    const resultados = Array.from(agrupadas.entries()).map(([employeeId, emp]) => {
      const porcentaje = emp.totalPosibles > 0
        ? (emp.totalScore / emp.totalPosibles) * 100
        : 0

      let rubrica = ''
      if (porcentaje >= 90) rubrica = 'Excelente'
      else if (porcentaje >= 75) rubrica = 'Bueno'
      else if (porcentaje >= 50) rubrica = 'Regular'
      else rubrica = 'Bajo rendimiento'

      return {
        employee: emp.employee,
        totalEvaluaciones: emp.totalEvaluaciones,
        totalScore: emp.totalScore,
        totalPosibles: emp.totalPosibles,
        porcentaje: porcentaje.toFixed(2),
        rubrica,
        year: year ? Number(year) : new Date().getFullYear(),
        trimestre: trimestre ? Number(trimestre) : Math.ceil((new Date().getMonth() + 1) / 3)
      }
    })

    return NextResponse.json({ success: true, data: resultados })
  } catch (error) {
    console.error('Error acumulado:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
