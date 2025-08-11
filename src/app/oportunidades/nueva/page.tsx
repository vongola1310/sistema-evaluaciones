'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"

export default function NuevaOportunidadPage() {
  const [empleados, setEmpleados] = useState<any[]>([])
  const [number, setNumber] = useState('')
  const [name, setName] = useState('')
  const [state, setState] = useState('activa')
  const [employeeId, setEmployeeId] = useState('')
  const [modalMessage, setModalMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/empleados')
      .then((res) => res.json())
      .then((data) => setEmpleados(data))
      .catch(() => setModalMessage('Error al cargar empleados'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/oportunidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, name, state, employeeId })
      })

      const data = await res.json()

      if (!res.ok) {
        setModalMessage(data.error || 'Error al guardar la oportunidad')
        return
      }

      window.location.href = '/oportunidades/listado'
    } catch {
      setModalMessage('Error de conexión con el servidor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">
        Nueva Oportunidad
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto space-y-6 bg-gray-800 p-6 rounded shadow-lg"
      >
        <div>
          <label className="block text-sm text-gray-300 mb-1">Número de Oportunidad</label>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            type="text"
            required
            className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            required
            className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Estado</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded"
          >
            <option value="activa">Activa</option>
            <option value="cerrada">Cerrada</option>
            <option value="en seguimiento">En seguimiento</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Asignar a:</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded"
          >
            <option value="">Selecciona un empleado</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 justify-between">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold shadow text-center flex-1"
          >
            ← Regresar al Dashboard
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded font-semibold shadow flex-1 text-center ${
              isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Oportunidad'}
          </button>
        </div>
      </form>

      {modalMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded shadow-lg max-w-sm text-center">
            <p className="text-red-400 font-semibold">{modalMessage}</p>
            <button
              onClick={() => setModalMessage(null)}
              className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
    </MainLayout>
  )
  
}
