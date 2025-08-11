// src/app/empleados/page.tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MainLayout from "@/components/MainLayout"

export default async function ListaEmpleados() {
  const session = await getServerSession(authOptions)

  // 🔒 Redirección si no hay sesión
  if (!session) {
    redirect('/login')
  }

  const empleados = await prisma.employee.findMany({
    orderBy: { lastName: 'asc' },
  })

  return (
    <MainLayout>
    <div className=" p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-green-400 text-center">Lista de empleados</h1>

        <div className="mb-6 text-center">
          <Link
            href="/empleados/nuevo"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold shadow"
          >
            ➕ Nuevo empleado
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-gray-800 rounded-xl overflow-hidden">
            <thead className="bg-gray-700 text-left text-gray-300">
              <tr>
                <th className="px-4 py-2">Nombre completo</th>
                <th className="px-4 py-2">Número de empleado</th>
                
              </tr>
            </thead>
            <tbody>
              {empleados.length > 0 ? (
                empleados.map((emp) => (
                  <tr key={emp.id} className="border-t border-gray-700 hover:bg-gray-800">
                    <td className="px-4 py-2">{emp.firstName} {emp.lastName}</td>
                    <td className="px-4 py-2">{emp.employeeNo}</td>
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-gray-400">
                    No hay empleados registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow"
          >
            ← Regresar al Dashboard
          </Link>
        </div>
      </div>
    </div>
    </MainLayout>
  )
}
