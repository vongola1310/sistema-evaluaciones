'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
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
    const [mesFiltro, setMesFiltro] = useState<number | null>(null)
    const [fechaInicio, setFechaInicio] = useState<string>('')
    const [fechaFin, setFechaFin] = useState<string>('')

    const fetchAcumulado = async () => {
        const params = new URLSearchParams()

        if (fechaInicio && fechaFin) {
            params.append('fechaInicio', fechaInicio)
            params.append('fechaFin', fechaFin)
        } else if (mesFiltro && yearFiltro) {
            params.append('mes', String(mesFiltro))
            params.append('year', String(yearFiltro))
        } else if (trimestreFiltro && yearFiltro) {
            params.append('trimestre', String(trimestreFiltro))
            params.append('year', String(yearFiltro))
        }

        const res = await fetch(`/api/evaluaciones/acumulado?${params.toString()}`)
        const data = await res.json()
        if (res.ok) {
            setAcumulados(data.data)
        }
    }

    useEffect(() => {
        fetchAcumulado()
    }, [trimestreFiltro, yearFiltro, mesFiltro, fechaInicio, fechaFin])

    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]

    const formatearFecha = (fecha: string) => {
        const [a, m, d] = fecha.split('-')
        return `${d}/${m}/${a}`
    }

    const mostrarPeriodo = (e: Acumulado) => {
        if (fechaInicio && fechaFin) {
            return `Semana del ${formatearFecha(fechaInicio)} al ${formatearFecha(fechaFin)}`
        } else if (mesFiltro) {
            return `Mes: ${meses[mesFiltro - 1]}`
        } else if (trimestreFiltro && yearFiltro) {
            return `Q${e.trimestre} ${e.year}`
        } else {
            return 'Sin filtro'
        }
    }

    return (
        <MainLayout>
            
        <div className="p-6">
            <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">Panel Acumulado por Empleado</h1>

            <div className="flex flex-wrap gap-4 mb-6">
                {/* Filtro de trimestre */}
                <select
                    value={trimestreFiltro ?? ''}
                    onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null
                        setTrimestreFiltro(val)
                        setMesFiltro(null)
                        setFechaInicio('')
                        setFechaFin('')
                    }}
                    className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded"
                >
                    <option value="">Todos los trimestres</option>
                    <option value="1">Q1</option>
                    <option value="2">Q2</option>
                    <option value="3">Q3</option>
                    <option value="4">Q4</option>
                </select>

                {/* Filtro de año */}
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

                {/* Filtro de mes */}
                <select
                    value={mesFiltro ?? ''}
                    onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null
                        setMesFiltro(val)
                        setTrimestreFiltro(null)
                        setFechaInicio('')
                        setFechaFin('')
                    }}
                    className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded"
                >
                    <option value="">Todos los meses</option>
                    {meses.map((mes, i) => (
                        <option key={i + 1} value={i + 1}>{mes}</option>
                    ))}
                </select>

                {/* Fecha Inicio */}
                <div className="flex flex-col">
                    <label htmlFor="fechaInicio" className="text-sm text-gray-300 mb-1">Fecha inicio</label>
                    <input
                        id="fechaInicio"
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => {
                            setFechaInicio(e.target.value)
                            setMesFiltro(null)
                            setTrimestreFiltro(null)
                        }}
                        className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded"
                    />
                </div>

                {/* Fecha Fin */}
                <div className="flex flex-col">
                    <label htmlFor="fechaFin" className="text-sm text-gray-300 mb-1">Fecha final</label>
                    <input
                        id="fechaFin"
                        type="date"
                        value={fechaFin}
                        onChange={(e) => {
                            setFechaFin(e.target.value)
                            setMesFiltro(null)
                            setTrimestreFiltro(null)
                        }}
                        className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded"
                    />
                </div>
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
                                    <td className="px-4 py-2">
                                        <Link
                                            href={`/evaluaciones/empleado/${e.employee.employeeNo}/${e.year}/${e.trimestre}`}
                                            className="text-blue-400 hover:underline"
                                        >
                                            {e.employee.firstName} {e.employee.lastName} ({e.employee.employeeNo})
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2">{e.totalEvaluaciones}</td>
                                    <td className="px-4 py-2 text-green-400">{e.totalScore} / {e.totalPosibles}</td>
                                    <td className="px-4 py-2">{e.porcentaje}%</td>
                                    <td className="px-4 py-2">{e.rubrica}</td>
                                    <td className="px-4 py-2">{mostrarPeriodo(e)}</td>
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
        </MainLayout>
    )
}
