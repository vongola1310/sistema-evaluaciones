'use client'

import { useState, useEffect, FormEvent, FC, ChangeEvent } from 'react'
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import { toast } from 'react-hot-toast'
import { User, Hash, ChevronLeft, Plus } from 'lucide-react'

// --- SUB-COMPONENTES DE DISEÑO ---
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
export default function NuevoEmpleadoPage() {
  const [firstName, setFirstname] = useState("")
  const [lastName, setLastName] = useState("")
  const [employeeNo, setEmployeeNo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const loadingToast = toast.loading('Guardando empleado...')

    try {
      const res = await fetch('/api/empleados', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, employeeNo }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el empleado');
      }

      toast.success('Empleado registrado correctamente', { id: loadingToast });
      router.push('/empleados') // Redirige a la lista de empleados
    } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Ocurrió un error', { id: loadingToast });
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
            <Link href="/empleados" className="flex items-center gap-2 text-sm text-brand-green hover:text-green-700 transition-colors w-fit mb-2">
              <ChevronLeft size={16} /> Volver al Listado de Empleados
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-brand-foreground">Registrar Nuevo Empleado</h1>
            <p className="text-lg text-gray-600 mt-2">Completa la información para añadir un miembro al equipo.</p>
        </div>

        <div className="bg-brand-background border border-brand-border rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    id="firstName"
                    type="text"
                    label="Nombre(s)"
                    value={firstName}
                    onChange={(e) => setFirstname(e.target.value)}
                    icon={User}
                    required
                />
                <InputField
                    id="lastName"
                    type="text"
                    label="Apellidos"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    icon={User}
                    required
                />
              </div>

                <InputField
                    id="employeeNo"
                    type="text"
                    label="Número de Empleado (ID)"
                    value={employeeNo}
                    onChange={(e) => setEmployeeNo(e.target.value)}
                    icon={Hash}
                    required
                />

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
                                <span>Guardar Empleado</span>
                            </>
                        )}
                    </button>
                    <Link
                        href="/empleados"
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