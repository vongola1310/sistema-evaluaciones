import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    
    // ✅ LOG 1: Verificamos qué ID estamos recibiendo
    console.log(`--- API de Detalle Mensual: Buscando reporte con ID: ${id} ---`);

    if (isNaN(id)) {
      console.log("Error: El ID no es un número válido.");
      return NextResponse.json({ error: 'ID de reporte inválido' }, { status: 400 });
    }

    const evaluation = await prisma.commercialEvaluation.findUnique({
      where: { id },
      include: {
        employee: true,
        evaluator: true,
      },
    });

    // ✅ LOG 2: Vemos el resultado de la búsqueda en la base de datos
    console.log("Resultado de la búsqueda en Prisma:", evaluation);

    if (!evaluation) {
      console.log("No se encontró ninguna evaluación con ese ID.");
      return NextResponse.json({ error: 'Evaluación mensual no encontrada' }, { status: 404 });
    }

    return NextResponse.json(evaluation);

  } catch (error) {
    console.error(`Error fetching commercial evaluation ${params.id}:`, error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}