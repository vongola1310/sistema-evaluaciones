import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const { firstName, lastName, employeeNo } = await request.json()

  try {
    // Validar duplicado
    const exists = await prisma.employee.findUnique({
      where: { employeeNo },
    })

    if (exists) {
      return NextResponse.json(
        { error: 'Ya existe un empleado con ese número.' },
        { status: 400 }
      )
    }

    // Crear empleado
    const newEmployee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        employeeNo,
      },
    })

    return NextResponse.json(newEmployee)
  } catch (error) {
    console.error('Error al guardar empleado:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}