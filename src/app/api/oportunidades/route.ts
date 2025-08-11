import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(){
  const opportunities = await prisma.opportunity.findMany({
    select:{
      id:true,
      number:true,
      name:true,
      state:true,
      employee:{
        select:{
          id:true,
          firstName:true,
          lastName:true,
          employeeNo:true,
        },
      },
    },
  });
  return NextResponse.json(opportunities);
}

export async function POST(request: Request) {
  try {
    const { number, name, createdBy, state, employeeId } = await request.json();

    // Validación básica
    if (!number?.trim() || !name?.trim() || !state || !employeeId) {
      return NextResponse.json(
        { success: false, error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si ya existe una oportunidad con el mismo número
    const exists = await prisma.opportunity.findUnique({
      where: { number: number.trim() },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, error: "Ya existe una oportunidad con ese número" },
        { status: 409 } // 409 = conflicto
      );
    }

    // Crear nueva oportunidad
    const newOpportunity = await prisma.opportunity.create({
      data: {
        number: number.trim(),
        name: name.trim(),
        state,
        employeeId: parseInt(employeeId),
        ...(createdBy && {
          createdBy: {
            connect: { email: createdBy },
          },
        }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newOpportunity,
        message: "Oportunidad creada correctamente",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creando oportunidad:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
