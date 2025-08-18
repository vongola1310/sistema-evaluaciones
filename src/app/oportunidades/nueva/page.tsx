'use client'

import { useState, useEffect, FormEvent, FC, ChangeEvent } from 'react'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Plus, ChevronLeft, Hash, Briefcase, User } from 'lucide-react'

// --- INTERFACES ---
interface Employee {
  id: number;
  fullName: string;
}

// --- SUB-COMPONENTES DE DISEÑO (LIGHT MODE) ---
const InputField: FC<{ id: string, type: string, label: string, value: string, onChange: (e: ChangeEvent<HTMLInputElement>) => void, icon: any, required?: boolean }> = 
({ id, type, label, value, onChange, icon: Icon, required = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-600">
      {label}
    </label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="block w-full rounded-md border-0 py-2.5 pl-10 bg-gray-50 text-brand-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green sm:text-sm"
      />
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function NuevaOportunidadPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [number, setNumber] = useState('')
  const [name, setName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter();

  useEffect(() => {
    fetch('/api/empleados', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch(() => toast.error('Error al cargar la lista de empleados'))
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const loadingToast = toast.loading('Guardando oportunidad...')

    try {
      const res = await fetch('/api/oportunidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, name, employeeId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar la oportunidad')
      }
      
      toast.success('Oportunidad creada correctamente', { id: loadingToast })

      // ✅ CAMBIO: Esperamos un momento antes de redirigir
      setTimeout(() => {
        router.push('/oportunidades/listado')
      }, 1500); // 1.5 segundos de espera

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error de conexión', { id: loadingToast });
      setIsSubmitting(false); // Reactivar el botón si hay error
    } 
    // No usamos 'finally' para que el botón permanezca desactivado durante la redirección
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
            <Link href="/oportunidades/listado" className="flex items-center gap-2 text-sm text-brand-green hover:text-green-700 transition-colors w-fit mb-2">
              <ChevronLeft size={16} /> Volver al Listado
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-brand-foreground">Crear Nueva Oportunidad</h1>
            <p className="text-lg text-gray-600 mt-2">Rellena los siguientes campos para registrar una nueva oportunidad en el sistema.</p>
        </div>
        
        <div className="bg-brand-background border border-brand-border rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                    id="number"
                    type="text"
                    label="Número de Oportunidad"
                    value={number}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNumber(e.target.value)}
                    icon={Hash}
                    required
                />
                <InputField
                    id="name"
                    type="text"
                    label="Nombre de la Oportunidad"
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    icon={Briefcase}
                    required
                />
                <div>
                    <label htmlFor="employeeId" className="block text-sm font-medium text-gray-600">Asignar a Empleado</label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <select
                            id="employeeId"
                            value={employeeId}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setEmployeeId(e.target.value)}
                            required
                            className="block w-full rounded-md border-0 py-2.5 pl-10 bg-gray-50 text-brand-foreground shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green sm:text-sm"
                        >
                            <option value="">Selecciona un empleado</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.fullName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-6 border-t border-brand-border flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex w-full justify-center items-center gap-2 py-3 px-4 rounded-lg font-bold text-white transition-all bg-brand-green hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed sm:w-auto"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <Plus size={18}/>
                                <span>Guardar Oportunidad</span>
                            </>
                        )}
                    </button>
                    <Link
                        href="/oportunidades/listado"
                        className="w-full sm:w-auto text-center px-4 py-3 rounded-lg font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
      </div>
    </MainLayout>
  )
}