import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Asegura que esta ruta siempre se ejecute de forma dinámica para evitar caché
export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } } // ✅ Firma de la función corregida
) {
  try {
    const numericId = parseInt(params.id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "El ID proporcionado no es un número válido." },
        { status: 400 }
      );
    }

    // ✅ LÓGICA DE BORRADO EN CASCADA CON TRANSACCIÓN
    // Una transacción asegura que todas las operaciones se completen con éxito, o ninguna lo haga,
    // manteniendo la base de datos consistente.
    await prisma.$transaction(async (tx) => {
      // 1. Borrar todas las evaluaciones del empleado.
      // Son lo más profundo en la jerarquía, así que se van primero.
      await tx.evaluation.deleteMany({
        where: {
          weeklyReport: {
            employeeId: numericId,
          },
        },
      });

      // 2. Borrar todos los reportes semanales del empleado.
      await tx.weeklyReport.deleteMany({
        where: { employeeId: numericId },
      });

      // 3. Borrar todas las oportunidades del empleado.
      // (Aunque tengan cascade, es más seguro ser explícito en una transacción compleja)
      await tx.opportunity.deleteMany({
        where: { employeeId: numericId },
      });
      
      // 4. Finalmente, con todos sus registros dependientes eliminados, borrar al empleado.
      await tx.employee.delete({
        where: { id: numericId },
      });
    });

    // Si la transacción fue exitosa, devolvemos una respuesta de éxito.
    return new NextResponse(null, { status: 204 }); // 204 = No Content

  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al intentar eliminar el empleado.' },
      { status: 500 }
    );
  }
}