// scripts/crearEvaluador.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = 'estela.carrera'
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name: 'Estela Nizaye Carrera Sarmiento',
      email: 'estela.carrera@euroimmun.mx',
      password: hashedPassword,
      role: 'evaluador',
    },
  })

  console.log('✅ Usuario evaluador creado:')
  console.log(user)
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())
