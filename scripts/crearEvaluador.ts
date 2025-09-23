// scripts/crearEvaluador.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 1. Define aquí la lista de usuarios que quieres crear
const usersToCreate = [
  {
    name: 'Jesus Abrego Campos',
    email: 'jesus.abrego@euroimmun.mx',
    password: 'admin', // Puedes poner contraseñas diferentes para cada uno
    role: 'evaluador',
  }
  // ... puedes añadir más usuarios aquí
];

async function main() {
  console.log('Iniciando la creación de usuarios...');

  // 2. Preparamos los datos: hasheamos todas las contraseñas
  const usersWithHashedPasswords = await Promise.all(
    usersToCreate.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return {
        ...user,
        password: hashedPassword,
      };
    })
  );

  // 3. Usamos createMany para crear todos los usuarios en una sola operación
  const createdUsers = await prisma.user.createMany({
    data: usersWithHashedPasswords,
    skipDuplicates: true, // Opcional: si un email ya existe, lo ignora en lugar de dar error
  });

  console.log(`✅ Se crearon ${createdUsers.count} nuevos usuarios evaluadores.`);
}

main()
  .catch((e) => {
    console.error('Ocurrió un error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })