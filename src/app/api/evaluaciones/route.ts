// app/api/evaluaciones/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { error } from 'console'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'evaluador'){
    return NextResponse.json(
      {success:false,error:'acceso no autorizado se requiere rol de evaluador'},
      {status:401}

    )
  }


  try {
    const data = await request.json()
    console.log('Datos Recibidos',data)

    const requiereFields=['employeeId','opportunityId']
    const missingFields= requiereFields.filter(field=>!data[field])

    if(missingFields.length>0){
      return NextResponse.json(
        {
          succes:false,
          error:'campos requeridos faltantes',
           details: `Faltan: ${missingFields.join(', ')}`
        },
        {status:400}
      )
    }

    const employeeId=Number(data.employeeId)
    const opportunityId=Number(data.opportunityId)
    const evaluatorId=session.user.id

    if(isNaN(employeeId)|| isNaN(opportunityId)){
      return NextResponse.json(
        {
          success:false,
          error: 'IDs inválidos',
          details: `employeeId: ${data.employeeId}, opportunityId: ${data.opportunityId}`
        },
        {status:400}
      )
    }
  const [employee,opportunity]= await Promise.all([
    prisma.employee.findUnique({where:{id:employeeId}}),
    prisma.opportunity.findUnique({where:{id:opportunityId}})
  ])

  if(!employee||!opportunity){
    return NextResponse.json(
      {
        
      }
    )
  }

  }catch{
    
  }
 
}

// Opcional: Endpoint GET para obtener evaluaciones
export async function GET(request: Request) {
 const { searchParams } = new URL(request.url)

 const evaluador = searchParams.get('evaluador')//string
 const empleado = searchParams.get(' empleado')//number
 const oportunidad = searchParams.get('oportunidad')//number

 try{
  const evaluations = await prisma.evaluation.findMany({
    where:{
      ...(evaluador && {evaluatorId:evaluador}),
      ...(empleado && {employeeId:parseInt(empleado)}),
      ...(oportunidad) &&{opportunityId:parseInt(oportunidad)}
    },
    include:{
      employee:{
        select:{
          id:true,
          firstName:true,
          lastName:true
        }
      },
      opportunity:{
        select:{
          id:true,
          number:true,
          name:true
        }
      },
      evaluator:{
        select:{
          id:true,
          name:true,
          email:true
        }
      }
    },
    orderBy:{
      createdAt:'desc'
    }

  })

  return NextResponse.json({
    succes:true,
    data:evaluations

  })
 }catch (error) {
  console.error('Erroe al obtener evaluaciones:',error)
  return NextResponse.json(
    {
      success:false,
      error:'Error al cargar evaluaciones'
    },
    {status:500}
  )
 }
}