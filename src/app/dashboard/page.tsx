'use client'

import ProtectedRoute from "@/components/ProtectedRoute"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function Dashboard(){
    const {data: session} = useSession()

    return(
        <ProtectedRoute>
         <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3x1 font-bold mb-6">Bienvenido, {session?.user?.name}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <link href="/evaluaciones">
                    <div className="bg-gray-800 p-6 rounded-lg hover:bg-green-700 transition duration-200 cursor-pointer">
                        <h2 className="text-xl font-bold">Consultar evaluaciones por empleado</h2>
                        <p className="text-sm text-gray-300">Revisar el historial de evaluaciones</p>
                    </div>
                </link>
                <link href="/empleados">
                  <div className="bg-gray-800 p-6 rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer">
                    <h2 className="text-xl font-bold">Evaluar empleados </h2>
                    <p className="text-sm text-gray-300">Lista de empleados para nueva evaluacion </p>
                  </div>     
                </link>
            </div>
         </div>
        </ProtectedRoute>
    )
}