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
    const notifications = await prisma.notification.findMany({ // ✅ CORREGIDO: de notifications a notification
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: 'Error al cargar notificaciones' }, { status: 500 })
  }
}

// --- FUNCIÓN PATCH: Marca las notificaciones como leídas ---
export async function PATCH() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  
  try {
    await prisma.notification.updateMany({ // ✅ CORREGIDO: de notifications a notification
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