import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { error } from "console";


export async function POST(request: Request) {
  try {
    const {number,name,createdBy}=await request.json()
    
    // Validación básica
    if(!number?.trim() || !name?.trim()){
        return NextResponse.json(
            {succes: false, error:"Numero y nombre son requeridos"},
            { status: 400 }
        )
    }

    const newOpportunity = await prisma.opportunity.create({
      data: {
       number: number.trim(),
       name: number.trim(),
       ...(createdBy&&{ createdBy:{connect:{email:createdBy } } })
      }
    })
//Respuesta Explicita del exito
return NextResponse.json(
    {
        success:true,
        data:newOpportunity,
        message:"Oportunidad creada correctamente"
    },
    {status:201}//201 creacion exitosa
)

  } catch (error: any) {
    //manejo detallado de errores
    const status = error.code === 'P2002' ? 409 : 500 //duplicados
    return NextResponse.json(
        {
            succes: false,
            error: error.code === 'P2002'
            ? "El numero de oportunidad ya existe"
            : "Error interno del servidor",
            detail: process.env.NODE_ENV === 'development'? error.message:undefined
        },
        { status }
    )
  }
}

  
