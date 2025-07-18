'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from 'next/link'

export default function NuevaOportunidad() {
  const [number, setNumber] = useState('')
  const [name, setName] = useState('')

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <p>Cargando verificación de sesión...</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.email) {
      alert('No se puede verificar su identidad')
      return
    }

    try {
      const res = await fetch('/api/oportunidades', {
        method: 'POST',
        body: JSON.stringify({
          number,
          name,
          createBY: session?.user?.email
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || "Error desconocido")
      }

      router.push('/dashboard?success=Oportunidad creada')
    } catch (error: any) {
      console.error("Error completo:", error)
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-400">Registrar nueva oportunidad</h1>

        <label className="block mb-4">
          Número de oportunidad
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded text-white"
            required
          />
        </label>

        <label className="block mb-6">
          Nombre de oportunidad
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded text-white"
            required
          />
        </label>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
        >
          Guardar
        </button>
      </form>

      <div className="mt-6">
        <Link
          href="/dashboard"
          className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow"
        >
          ← Regresar al Dashboard
        </Link>
      </div>
    </div>
  )
}
