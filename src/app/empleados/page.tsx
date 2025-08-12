// src/app/empleados/page.tsx

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MainLayout from "@/components/MainLayout"
import DeleteEmployeeButton from '@/components/DeleteEmployeeButton'
import { Plus, UserX, ChevronLeft } from 'lucide-react'
import type { FC } from 'react'

// --- TYPE DEFINITION (for clarity) ---
type Employee = {
    id: number;
    firstName: string;
    lastName: string;
    employeeNo: string;
}

// --- SUB-COMPONENTS FOR DESIGN ---

/**
 * EmployeeCard: A card to display a single employee's information and actions.
 */
const EmployeeCard: FC<{ employee: Employee }> = ({ employee }) => {
    const initial = employee.firstName?.charAt(0).toUpperCase() || 'E';

    return (
        <div className="bg-gray-800 border border-white/10 rounded-xl shadow-lg p-4 flex items-center justify-between gap-4 transition-all hover:border-green-500/30 hover:bg-gray-800/80">
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center ring-2 ring-gray-600">
                    <span className="text-xl font-bold text-green-400">{initial}</span>
                </div>
                {/* Info */}
                <div>
                    <h3 className="text-base font-bold text-white">{employee.firstName} {employee.lastName}</h3>
                    <p className="text-xs text-gray-400 font-mono">ID: {employee.employeeNo}</p>
                </div>
            </div>
            {/* Action */}
            <div className="flex-shrink-0">
                <DeleteEmployeeButton employeeId={employee.id} />
            </div>
        </div>
    );
};

/**
 * EmptyState: A component to show when there are no employees.
 */
const EmptyState = () => (
    <div className="text-center py-20 bg-gray-800/50 rounded-lg">
        <UserX className="mx-auto text-gray-600" size={48} />
        <h3 className="mt-4 text-lg font-semibold text-white">No hay empleados registrados</h3>
        <p className="mt-1 text-sm text-gray-400">
            Comienza por añadir el primer miembro a tu equipo.
        </p>
        <Link
            href="/empleados/nuevo"
            className="mt-6 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
            <Plus size={18} />
            Añadir Empleado
        </Link>
    </div>
);


// --- MAIN PAGE COMPONENT ---

export default async function ListaEmpleados() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/login')
    }

    const empleados = await prisma.employee.findMany({
        orderBy: { lastName: 'asc' },
    })

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                {/* Encabezado de la Página */}
                <div className="mb-8">
                    <Link href="/dashboard" className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors w-fit mb-2">
                        <ChevronLeft size={16} /> Regresar al Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-white">Directorio de Empleados</h1>
                            <p className="text-lg text-gray-400 mt-2">Gestiona los miembros de tu equipo.</p>
                        </div>
                        <Link
                            href="/empleados/nuevo"
                            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                            Nuevo Empleado
                        </Link>
                    </div>
                </div>

                {/* Contenido Principal */}
                <div className="space-y-4">
                    {empleados.length > 0 ? (
                        empleados.map((emp) => (
                            <EmployeeCard key={emp.id} employee={emp} />
                        ))
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </div>
        </MainLayout>
    )
}