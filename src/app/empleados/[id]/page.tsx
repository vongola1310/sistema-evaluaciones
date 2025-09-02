import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import MainLayout from '@/components/MainLayout'
import { notFound } from 'next/navigation'
import { ChevronLeft, User, BarChart3 } from 'lucide-react'
import EmployeeAnalytics from '@/components/analytics/EmployeeAnalytics' // Importamos el componente de cliente para las gráficas

// Esta página es un Componente de Servidor, por lo que puede ser 'async'
export default async function EmployeeProfilePage({ params }: { params: { id: string } }) {
    const employeeId = parseInt(params.id, 10);

    if (isNaN(employeeId)) {
        return notFound();
    }

    // Buscamos la información básica del empleado en el servidor
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
            firstName: true,
            lastName: true,
            employeeNo: true,
        }
    });

    if (!employee) {
        return notFound();
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {/* Encabezado de la página */}
                <div className="mb-8">
                    <Link href="/empleados" className="flex items-center gap-2 text-sm text-brand-green hover:text-green-700 w-fit mb-4">
                        <ChevronLeft size={16} /> Volver al Directorio
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center ring-4 ring-brand-green/20">
                            <span className="text-3xl font-bold text-brand-green">
                                {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-brand-foreground">
                                {employee.firstName} {employee.lastName}
                            </h1>
                            <p className="text-lg text-gray-500 font-mono">
                                ID: {employee.employeeNo}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contenedor principal para las analíticas */}
                <div className="bg-brand-background border border-brand-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="text-brand-green" />
                        <h2 className="text-2xl font-semibold text-brand-foreground">Analíticas de Desempeño</h2>
                    </div>
                    
                    {/* Aquí renderizamos el componente de cliente que cargará y mostrará las gráficas */}
                    <EmployeeAnalytics employeeId={employeeId} />
                </div>
            </div>
        </MainLayout>
    );
}