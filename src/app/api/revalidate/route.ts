// src/app/api/revalidate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const tag = body.tag

  if (!tag) {
    return NextResponse.json({ error: 'Etiqueta (tag) requerida' }, { status: 400 })
  }

  // Esta es la función mágica de Next.js que limpia la caché para una etiqueta específica
  revalidateTag(tag)

  return NextResponse.json({ revalidated: true, now: Date.now() })
}