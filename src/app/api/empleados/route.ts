import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
// app/api/empleados/route.ts
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeNo: true // Agregado para mostrar el número de empleado
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    // Formatea los datos para mostrar nombre completo + número
    const formattedEmployees = employees.map(emp => ({
      id: emp.id,
      fullName: `${emp.firstName} ${emp.lastName} (${emp.employeeNo})`
    }))

    return NextResponse.json(formattedEmployees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Error al cargar empleados' },
      { status: 500 }
    )
  }
}



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
