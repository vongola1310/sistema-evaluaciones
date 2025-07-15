'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Acumulado {
    employee: {
        firstName: string
        lastName: string
        employeeNo: string
    }
    totalEvaluaciones: number
    totalScore: number
    totalPosibles: number
    porcentaje: string
    rubrica: string
    year: number
    trimestre: number
}



export default function PanelAcumulado() {

    const [acumulados, setAcumulados] = useState<Acumulado[]>([])
    const [trimestreFiltro, setTrimestreFiltro] = useState<number | null>(null)
    const [yearFiltro, setYearFiltro] = useState<number | null>(null)

    const fetchAcumulado = async () =>{
        const params = new URLSearchParams()
        if (trimestreFiltro) params.append('trimestre',String(trimestreFiltro))
        if (yearFiltro) params.append('year',String(yearFiltro))

        const res = await fetch(`/api/evaluaciones/acumulado?${params.toString()}`)
        const data = await res.json()

        if(res.ok){
            setAcumulados(data.data)
        }
    }

    useEffect(() => {
        fetchAcumulado()
    },[trimestreFiltro,yearFiltro])
    

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">Panel Acumulado por Empleado</h1>

            {/* Filtros de trimestre y año */}

            <div className="flex flex-wrap gap-4 mb-6">
                <select
                    value={trimestreFiltro ?? ''}
                    onChange={(e) => setTrimestreFiltro(e.target.value ? Number(e.target.value) : null)}
                    className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded"
                >
                    <option value="">Todos los trimestres</option>
                    <option value="1">Q1</option>
                    <option value="2">Q2</option>
                    <option value="3">Q3</option>
                    <option value="4">Q4</option>
                </select>
                <select
                    value={yearFiltro ?? ''}
                    onChange={(e) => setYearFiltro(e.target.value ? Number(e.target.value) : null)}
                    className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded"
                >
                    <option value="">Todos los años</option>
                    {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i
                        return <option key={year} value={year}>{year}</option>
                    })}
                </select>

            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-700 rounded overflow-hidden">
                    <thead className="bg-gray-800 text-gray-300">
                        <tr>
                            <th className="px-4 py-2 text-left">Empleado</th>
                            <th className="px-4 py-2 text-left">Evaluaciones</th>
                            <th className="px-4 py-2 text-left">Aciertos</th>
                            <th className="px-4 py-2 text-left">Promedio</th>
                            <th className="px-4 py-2 text-left">Rúbrica</th>
                            <th className="px-4 py-2 text-left">Periodo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {acumulados.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4 text-gray-400">No hay datos acumulados</td>
                            </tr>
                        ) : (
                            acumulados.map((e, idx) => (
                                <tr key={idx} className="border-t border-gray-700 hover:bg-gray-800">
                                    <td className='px-4 py-2'>                         
                                        <Link href={`/evaluaciones/empleado/${e.employee.employeeNo}/${e.year}/${e.trimestre}`}
                                        className="text-blue-400 hover:underine"
                                        >
                                         {e.employee.firstName} {e.employee.lastName} ({e.employee.employeeNo})
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2">{e.totalEvaluaciones}</td>
                                    <td className="px-4 py-2 text-green-400">{e.totalScore} / {e.totalPosibles}</td>
                                    <td className="px-4 py-2">{e.porcentaje}%</td>
                                    <td className="px-4 py-2">{e.rubrica}</td>
                                    <td className="px-4 py-2">Q{e.trimestre} {e.year}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Link href="/dashboard" className="inline-block mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow">
                ← Regresar al Dashboard
            </Link>
        </div>
    )
}
