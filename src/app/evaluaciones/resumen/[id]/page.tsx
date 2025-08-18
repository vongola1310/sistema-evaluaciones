// /evaluaciones/resumen/[id]/page.tsx

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/MainLayout'
import ReportView from '@/components/ReportView' // Importamos el componente compartido
import { ChevronLeft } from 'lucide-react'

export default async function ReporteSemanalPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return notFound();

  // ✅ CONSULTA CORREGIDA CON 'INCLUDE'
  const report = await prisma.weeklyReport.findUnique({
    where: { id },
    include: {
      employee: true,
      evaluator: true,
      evaluations: {
        include: {
          opportunity: true,
        },
        orderBy: {
            opportunity: { number: 'asc' }
        }
      },
    },
  });

  if (!report) return notFound();

  return (
    <MainLayout>
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <Link href="/evaluaciones/panel" className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors w-fit mb-2">
                        <ChevronLeft size={16} /> Volver al Panel
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight text-white">Reporte de Rendimiento Semanal</h1>
                </div>

                {/* El objeto 'report' ahora tiene la forma correcta que espera ReportView */}
                <ReportView report={report} />
            </div>
        </div>
    </MainLayout>
  );
}