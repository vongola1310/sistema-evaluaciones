'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false, // Evita que NextAuth haga redirección automática
    })

    if (res?.ok) {
      router.push('/dashboard') // Redirige al listado de empleados si login OK
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="block text-sm font-semibold">Correo electrónico</label>
          <input
            type="email"
            className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Contraseña</label>
          <input
            type="password"
            className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-white font-bold"
        >
          Ingresar
        </button>
      </form>
    </div>
  )
}
