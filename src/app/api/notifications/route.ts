// /src/app/api/notifications/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// --- FUNCIÓN GET: Obtiene las notificaciones de un usuario ---
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const notifications = await prisma.notifications.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10, // Traemos solo las 10 más recientes para no sobrecargar
    })
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: 'Error al cargar notificaciones' }, { status: 500 })
  }
}


// --- FUNCIÓN PATCH: Marca las notificaciones como leídas ---
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  
  try {
    // Marcamos todas las notificaciones no leídas del usuario como leídas
    await prisma.notifications.updateMany({
      where: { 
        userId: session.user.id,
        read: false 
      },
      data: { read: true },
    })
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: 'Error al actualizar notificaciones' }, { status: 500 })
  }
}