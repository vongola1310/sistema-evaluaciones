// src/app/empleados/page.tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ListaEmpleados() {
  const session = await getServerSession(authOptions)

  // 🔒 Si no hay sesión, redirige a login
  if (!session) {
    redirect('/login')
  }

  const empleados = await prisma.employee.findMany({
    orderBy: { lastName: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Lista de empleados</h1>

        <div className="mb-4">
          <Link href="/empleados/nuevo" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
            ➕ Nuevo empleado
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-xl overflow-hidden">
            <thead className="bg-gray-700 text-left">
              <tr>
                <th className="px-4 py-2">Nombre completo</th>
                <th className="px-4 py-2">Número de empleado</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((emp) => (
                <tr key={emp.id} className="border-t border-gray-700">
                  <td className="px-4 py-2">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-4 py-2">{emp.employeeNo}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      href={`/empleados/${emp.id}/editar`}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/evaluar/${emp.id}`}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                    >
                      Evaluar
                    </Link>
                  </td>
                </tr>
              ))}
              {empleados.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-gray-400">
                    No hay empleados registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
