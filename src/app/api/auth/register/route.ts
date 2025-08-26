import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // ✅ Se eliminó el console.log de depuración de aquí
    
    const { name, email, password, employeeNo } = body;

    // 1. Validación de datos de entrada
    if (!name || !email || !password || !employeeNo) {
      return NextResponse.json({ error: 'Todos los campos son requeridos.' }, { status: 400 });
    }

    // 2. Buscar si el email ya está en uso
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Este correo electrónico ya está registrado.' }, { status: 409 });
    }

    // 3. Buscar el perfil del empleado por su número
    const employeeProfile = await prisma.employee.findUnique({ where: { employeeNo } });
    if (!employeeProfile) {
      return NextResponse.json({ error: 'Número de empleado no encontrado. Contacta a tu evaluador.' }, { status: 404 });
    }
    if (employeeProfile.userId) {
      return NextResponse.json({ error: 'Este empleado ya tiene una cuenta activada.' }, { status: 409 });
    }

    // 4. Crear el nuevo usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'employee',
      },
    });

    // 5. Vincular el nuevo usuario al perfil del empleado
    await prisma.employee.update({
      where: { id: employeeProfile.id },
      data: { userId: newUser.id },
    });

    return NextResponse.json({ message: 'Usuario creado y vinculado exitosamente.' }, { status: 201 });

  } catch (error) {
    console.error("Error en el registro:", error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}