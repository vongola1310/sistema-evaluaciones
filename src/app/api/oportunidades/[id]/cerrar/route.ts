// src/app/api/oportunidades/[id]/cerrar/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

interface Params {
  params: {
    id: string
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const id = parseInt(params.id, 10)

  if (isNaN(id)) {
    return NextResponse.json(
      { error: 'ID inválido' },
      { status: 400 }
    )
  }

  try {
    const updated = await prisma.opportunity.update({
      where: { id },
      data: { state: 'cerrada' },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'No se pudo cerrar la oportunidad' },
      { status: 500 }
    )
  }
}
