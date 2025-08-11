'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
export default function NuevoEmpleado() {
  const [firstName, setFirstname] = useState("")
  const [lastName, setLastName] = useState("")
  const [employeeNo, setEmployeeNo] = useState("")

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return <p className="text-white text-center mt-10">Cargando...</p>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/empleados', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, employeeNo }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (res.ok) {
      router.push('/empleados')
    }
  }

  return (
    <MainLayout>
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-400">Registrar nuevo empleado</h1>

        <label className="block mb-4">
          Nombre(s)
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstname(e.target.value)}
            className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded text-white"
            required
          />
        </label>

        <label className="block mb-4">
          Apellidos
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded text-white"
            required
          />
        </label>

        <label className="block mb-6">
          Número de empleado (ej: 33126)
          <input
            type="text"
            value={employeeNo}
            onChange={(e) => setEmployeeNo(e.target.value)}
            className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded text-white"
            required
          />
        </label>

        <div className="flex justify-between items-center mt-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
          >
            Guardar
          </button>

          <button
            type="button"
            onClick={() => router.push('/empleados')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
          >
            👁 Ver registros
          </button>
        </div>
      </form>

      {/* Botón para volver al dashboard, separado visualmente */}
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow"
        >
          ← Regresar al Dashboard
        </Link>
      </div>
    </div>
    </MainLayout>
  )
}
