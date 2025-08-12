// app/api/empleados/[id]/route.ts

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

export async function DELETE(
  request: Request, 
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const numericId = parseInt(id)

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "El ID proporcionado no es un número válido." },
        { status: 400 }
      )
    }

    // 1. Encontrar todas las oportunidades que pertenecen al empleado a eliminar.
    const opportunitiesToDelete = await prisma.opportunity.findMany({
      where: { employeeId: numericId },
      select: { id: true } // Solo necesitamos sus IDs
    });
    const opportunityIds = opportunitiesToDelete.map(op => op.id);

    // 2. Iniciar la transacción para un borrado seguro y en orden.
    await prisma.$transaction([
      // 2a. BORRAR NIETOS: Eliminar todas las evaluaciones que apunten a las oportunidades encontradas.
      // Esta es la clave para resolver el error.
      prisma.evaluation.deleteMany({
        where: { opportunityId: { in: opportunityIds } },
      }),
      
      // 2b. BORRAR HIJOS: Ahora que las evaluaciones se han ido, eliminar las oportunidades.
      prisma.opportunity.deleteMany({
        where: { id: { in: opportunityIds } },
      }),

      // 2c. (Opcional pero seguro) Borrar evaluaciones directamente ligadas al empleado que no tuvieran oportunidad.
      // Es una salvaguarda por si acaso.
      prisma.evaluation.deleteMany({
        where: { employeeId: numericId }
      }),
      
      // 2d. BORRAR ABUELO: Finalmente, eliminar al empleado.
      prisma.employee.delete({
        where: { id: numericId },
      }),
    ]);

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Error al eliminar empleado:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
         return NextResponse.json(
          { error: 'No se puede eliminar. El empleado tiene evaluaciones u oportunidades asociadas.' },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}