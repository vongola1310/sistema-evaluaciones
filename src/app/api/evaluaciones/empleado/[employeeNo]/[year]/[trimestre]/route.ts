// /api/evaluaciones/empleado/[employeeNo]/[year]/[trimestre]/route.ts

import { NextResponse } from 'next/server'
import {prisma} from '@/lib/prisma'
import { startOfQuarter, endOfQuarter } from 'date-fns'

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: { employeeNo: string; year: string; trimestre: string }
  }
) {
  const { employeeNo, year, trimestre } = params

  const parsedYear = parseInt(year, 10)
  const parsedTrim = parseInt(trimestre, 10)

  if (!parsedYear || !parsedTrim || parsedTrim < 1 || parsedTrim > 4) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const startDate = startOfQuarter(new Date(parsedYear, (parsedTrim - 1) * 3))
  const endDate = endOfQuarter(startDate)

  const evaluaciones = await prisma.evaluation.findMany({
    where: {
      employee: {
        employeeNo: employeeNo,
      },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      evaluator: {
        select: { name: true, email: true },
      },
      opportunity: {
        select: { number: true, name: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json({ data: evaluaciones })
}
