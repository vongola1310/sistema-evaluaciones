// /api/oportunidades/[id]/cerrar/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const { status } = await request.json(); // Esperamos recibir "ganada" or "perdida"

    if (!['ganada', 'perdida'].includes(status)) {
      return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
    }

    const opportunityToClose = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunityToClose) {
        return NextResponse.json({ error: 'Oportunidad no encontrada.' }, { status: 404 });
    }

    // Calculamos los días que estuvo abierta
    const createdAt = new Date(opportunityToClose.createdAt);
    const closedAt = new Date();
    const daysOpen = Math.round((closedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        state: status,
        closedAt: closedAt,
        daysOpen: daysOpen,
      },
    });

    return NextResponse.json(updatedOpportunity);
  } catch (error) {
    console.error(`Error closing opportunity ${params.id}:`, error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}