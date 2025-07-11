import { prisma } from '@/lib/prisma'
import { error } from 'console'
import { NextResponse } from 'next/server'

export async function GET(
    _request: Request,
    {params}:{params:{id:string}}
){
    const id = parseInt(params.id)

    if (isNaN(id)){
        return NextResponse.json({succes:false,error:'ID invalido'},{status:400})
    }
 try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNo: true
          }
        },
        opportunity: {
          select: {
            number: true,
            name: true
          }
        },
        evaluator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: evaluation })
  } catch (error) {
    console.error('Error en GET evaluación/:id', error)
    return NextResponse.json(
      { error: 'Error interno al cargar la evaluación' },
      { status: 500 }
    )
  }
}
   



    

   