// src/app/oportunidades/cerradas/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MainLayout from "@/components/MainLayout"
import OportunidadesCerradasClient from '@/components/OportunidadesCerradasClient'

export default async function OportunidadesCerradas() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'evaluador') {
    redirect('/')
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-400 mb-2">
            Oportunidades Cerradas
          </h1>
          <p className="text-gray-400">
            Lista completa de oportunidades que han sido cerradas
          </p>
        </div>

        <OportunidadesCerradasClient />
      </div>
    </MainLayout>
  )
}