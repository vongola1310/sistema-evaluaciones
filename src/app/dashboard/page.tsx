// src/app/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import MainLayout from "@/components/MainLayout";

// Importa los iconos que vamos a usar
import {
  ClipboardList,
  FilePenLine,
  Lightbulb,
  UserPlus,
  Users,
  Archive,
  Lock,
} from "lucide-react";

// Importa los tipos necesarios de React
import type { ReactNode, ElementType } from "react";

// ✅ PASO 1: Definimos la interfaz para las props de la tarjeta
interface DashboardCardProps {
  href: string;
  icon: ElementType;
  title: string;
  children: ReactNode;
}

// Un componente reutilizable para las tarjetas para mantener el código limpio
// ✅ PASO 2: Aplicamos la interfaz a las props del componente
const DashboardCard = ({ href, icon: Icon, title, children }: DashboardCardProps) => {
  return (
    <Link
      href={href}
      className="
        group relative block p-px rounded-2xl 
        bg-gradient-to-r from-green-400 to-cyan-400
        shadow-lg transition-transform duration-300 ease-in-out
        hover:scale-[1.02] hover:-translate-y-1
      "
    >
      <div className="flex h-full flex-col gap-4 bg-gray-900 text-white rounded-[15px] p-6">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-green-400" />
        </div>
        <div className="flex-grow">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
        </div>
      </div>
    </Link>
  );
};

export default async function DashboardEvaluador() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "evaluador") {
    redirect("/");
  }

  return (
    <MainLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold tracking-tight text-white">
              Bienvenido, <span className="text-green-400">{session.user.name || "Evaluador"}</span>
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              Selecciona una de las siguientes opciones para empezar a trabajar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DashboardCard
              href="/evaluaciones/panel"
              icon={ClipboardList}
              title="Consultar Evaluaciones"
            >
              Revisa el historial de evaluaciones de cada empleado.
            </DashboardCard>
            
            <DashboardCard
              href="/evaluaciones/nueva"
              icon={FilePenLine}
              title="Evaluar Empleados"
            >
              Accede al listado de empleados y comienza una nueva evaluación.
            </DashboardCard>

            <DashboardCard
              href="/oportunidades/nueva"
              icon={Lightbulb}
              title="Crear Oportunidad"
            >
              Registra una nueva oportunidad para asignarla a un empleado.
            </DashboardCard>
            
            <DashboardCard
              href="/empleados/nuevo"
              icon={UserPlus}
              title="Añadir Empleado"
            >
              Agrega un nuevo miembro del equipo al sistema de evaluaciones.
            </DashboardCard>
            
            <DashboardCard
              href="/empleados"
              icon={Users}
              title="Ver Empleados"
            >
              Consulta y gestiona la lista completa de tus empleados.
            </DashboardCard>

            <DashboardCard
              href="/oportunidades/listado"
              icon={Lock}
              title="Cerrar Oportunidades"
            >
              Gestiona y actualiza el estado de las oportunidades abiertas.
            </DashboardCard>

            <DashboardCard
              href="/oportunidades/cerradas"
              icon={Archive}
              title="Oportunidades Cerradas"
            >
              Consulta el archivo histórico de oportunidades completadas.
            </DashboardCard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}