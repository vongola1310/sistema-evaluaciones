'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"


export default function NuevoEmpleado() {
    const [firstName, setFirstname] = useState("")
    const [lastName, setLastName] = useState("")
    const [employeeNo, setEmployeeNo] = useState("")
    
    const { data: session, status }= useSession()
    const router = useRouter()

    //Redireccion si no esta autenticado
    useEffect(() => {
        if(status ==='unauthenticated'){
            router.push('/login')
        }
    },[status,router])

    //mientras la sesion carga s epued emostrar un mensaje o spinner
    if(status === 'loading'){
        return <p className="text-white text-center mt10" >Cargando............</p>
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
        </div>
    )
}