// app/api/evaluaciones/empleado/[employeeId]/[year]/[trimestre]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { error } from 'console'

export async function GET(
  _req: Request,
  { params }: { params: { employeeNo: string, year: string, trimestre: string } }
) {
  try {
    const employeeNo = params.employeeNo
    const year = parseInt(params.year)
    const trimestre = parseInt(params.trimestre)

    if (!employeeNo || isNaN(year) || isNaN(trimestre)) {
      return NextResponse.json({ success: false, error: 'Parámetros inválidos' }, { status: 400 })
    }

    //buscar al empleado por su numero 
    const employee = await prisma.employee.findUnique({
      where:{employeeNo}
    })

    if(!employee){
      return NextResponse.json({success:false,error:'Empleado no encontrado'})
    }

    const evaluaciones = await prisma.evaluation.findMany({
      where: {
        employeeId:employee.id,
        year,
        trimestre
      },
      include: {
        evaluator: {
          select: {
            name: true,
            email: true
          }
        },
        opportunity: {
          select: {
            number: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ success: true, data: evaluaciones })
  } catch (error) {
    console.error('Error al obtener evaluaciones del empleado:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
