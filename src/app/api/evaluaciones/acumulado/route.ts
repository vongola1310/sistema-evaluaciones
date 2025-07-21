// app/api/evaluaciones/acumulado/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trimestre = searchParams.get('trimestre')
    const year = searchParams.get('year')
    const mes = searchParams.get('mes')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    const where: any = {}

    // filtro por rango de fechas manual
    if (fechaInicio && fechaFin) {
      where.createdAt = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      }
    } 
    // Filtro por mes completo
    else if (mes && year) {
      const mesNum = parseInt(mes)
      const anioNum = parseInt(year)

      const startDate = new Date(anioNum, mesNum - 1, 1)
      const endDate = new Date(anioNum, mesNum, 0, 23, 59, 59, 999)

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      }
    } 
    // Filtro por trimestre
    else if (trimestre && year) {
      const tri = Number(trimestre)
      const anioNum = Number(year)
      const startMonth = (tri - 1) * 3
      const endMonth = startMonth + 2

      const startDate = new Date(anioNum, startMonth, 1)
      const endDate = new Date(anioNum, endMonth + 1, 0, 23, 59, 59, 999)

      where.trimestre = {
        gte: startDate,
        lte: endDate,
      }
    }

    const evaluaciones = await prisma.evaluation.findMany({
      where,
      include: {
        employee: true,
      },
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
          totalPosibles: 0,
        })
      }

      const empData = agrupadas.get(key)
      empData.totalEvaluaciones += 1
      empData.totalScore += evaluacion.scoreRaw
      empData.totalPosibles += evaluacion.totalPosibles
    }

    const resultados = Array.from(agrupadas.entries()).map(([employeeId, emp]) => {
      const porcentaje =
        emp.totalPosibles > 0
          ? (emp.totalScore / emp.totalPosibles) * 100
          : 0

      let rubrica = ''
      if (porcentaje >= 90) rubrica = 'Excelente'
      else if (porcentaje >= 75) rubrica = 'Bueno'
      else if (porcentaje >= 50) rubrica = 'Regular'
      else rubrica = 'Bajo rendimiento'

      // Determinar año y trimestre exactos
      let finalYear = year ? Number(year) : new Date().getFullYear()
      let finalTrimestre = trimestre
        ? Number(trimestre)
        : Math.ceil((new Date().getMonth() + 1) / 3)

      return {
        employee: emp.employee,
        totalEvaluaciones: emp.totalEvaluaciones,
        totalScore: emp.totalScore,
        totalPosibles: emp.totalPosibles,
        porcentaje: porcentaje.toFixed(2),
        rubrica,
        year: finalYear,
        trimestre: finalTrimestre,
      }
    })

    return NextResponse.json({ success: true, data: resultados })
  } catch (error) {
    console.error('Error acumulado:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
