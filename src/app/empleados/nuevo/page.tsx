'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

import { headers } from "next/headers"

export default function NuevoEmpleado() {
    const [firstName, setFirstname] = useState("")
    const [lastName, setLastName] = useState("")
    const [employeeNo, setEmployeeNo] = useState("")
    const router = useRouter()

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
            router.push('/empleados') // Lo hacemos después
        }

    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-2x1 font-bold mb-4">Registrar nuevo empleado</h1>

                <label className="block mb-2">
                    Nombre completo
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstname(e.target.value)}
                        className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded text-white"
                        required
                    />
                </label>

                <label className="block mb-2">
                    Apellidos
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded text-white"
                        required
                    />
                </label>

                <label className="block mb-4">
                    Número de empleado (ej:33126)

                    <input
                        type="text"
                        value={employeeNo}
                        onChange={(e) => setEmployeeNo(e.target.value)}
                        className="mt-1 p-2 w-full bg-gray-700 border border-gray-600 rounded text-white"
                        required
                    />
                </label>

                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
                >
                    Guardar
                </button>
            </form>
        </div>
    )
}
