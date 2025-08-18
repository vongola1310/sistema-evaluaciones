// /api/oportunidades/route.ts

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * FUNCIÓN GET: Obtiene una lista de oportunidades.
 * Puede ser filtrada por estado: 'abierta' o 'cerrada'.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let whereClause: any = {}

    if (status === 'cerrada') {
      whereClause = { state: { in: ['ganada', 'perdida'] } }
    } else if (status === 'abierta') {
      whereClause = { state: 'abierta' }
    }

    const opportunities = await prisma.opportunity.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNo: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    console.error('Error en GET /api/oportunidades:', error)
    return NextResponse.json(
      { error: 'Error al cargar oportunidades' },
      { status: 500 }
    )
  }
}

/**
 * FUNCIÓN POST: Crea una nueva oportunidad.
 * Garantiza una respuesta en todas las ramas.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, number, employeeId } = body;

        // 1. Validación de datos de entrada
        if (!name || !number || !employeeId) {
            return NextResponse.json({ error: 'Faltan campos requeridos (nombre, número o ID de empleado).' }, { status: 400 });
        }

        const employeeIdNum = parseInt(employeeId);
        if (isNaN(employeeIdNum)) {
            return NextResponse.json({ error: 'El ID del empleado debe ser un número.' }, { status: 400 });
        }

        // 2. Verificar que el empleado exista
        const employeeExists = await prisma.employee.findUnique({
            where: { id: employeeIdNum }
        });
        if (!employeeExists) {
            return NextResponse.json({ error: `El empleado con ID ${employeeIdNum} no existe.` }, { status: 404 });
        }
        
        // 3. Crear la oportunidad en la base de datos
        const newOpportunity = await prisma.opportunity.create({
            data: {
                name,
                number,
                employeeId: employeeIdNum,
                state: 'abierta', // El estado por defecto siempre es 'abierta'
            }
        });

        return NextResponse.json(newOpportunity, { status: 201 });

    } catch (error: any) {
        console.error('Error en POST /api/oportunidades:', error);
        
        // Manejar errores específicos de Prisma (ej: número de oportunidad duplicado)
        if (error.code === 'P2002' && error.meta?.target?.includes('number')) {
            return NextResponse.json({ error: 'Ya existe una oportunidad con ese número.' }, { status: 409 });
        }
        
        return NextResponse.json({ error: 'Error interno del servidor al crear la oportunidad.' }, { status: 500 });
    }
}