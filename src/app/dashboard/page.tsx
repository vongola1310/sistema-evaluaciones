'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import type { FC, ReactNode } from "react";
import { ClipboardList, FilePenLine, Lightbulb, UserPlus, Users, Archive, Lock } from "lucide-react";

// --- SUB-COMPONENTES DE DISEÑO (Estos no cambian) ---

const DashboardCard: FC<{ href: string, icon: any, title: string, children: ReactNode }> = ({ href, icon: Icon, title, children }) => {
    return (
        <Link
            href={href}
            className="group block p-6 rounded-2xl bg-brand-card border border-brand-border shadow-sm transition-all duration-300 ease-in-out hover:border-brand-green hover:shadow-brand-green/20 hover:-translate-y-1"
        >
            <div className="flex h-full flex-col gap-4">
                <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-brand-green" />
                </div>
                <div className="flex-grow">
                    <h2 className="text-xl font-bold text-brand-foreground mb-2">{title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">{children}</p>
                </div>
            </div>
        </Link>
    );
};

const DashboardSection: FC<{ title: string, children: ReactNode }> = ({ title, children }) => (
    <section className="mb-12">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-500 border-b border-brand-border pb-4 mb-8">
            {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {children}
        </div>
    </section>
);

// --- COMPONENTE PRINCIPAL DE LA PÁGINA (COMO CLIENTE) ---
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Mientras la sesión se está verificando, no hacemos nada.
    if (status === 'loading') {
      return;
    }

    // Si no está autenticado, lo enviamos al login.
    if (!session) {
      router.push('/login');
      return;
    }
    
    // Si está autenticado, revisamos el rol.
    if (session.user?.role === 'employee') {
      router.push('/mis-evaluaciones');
    } else if (session.user?.role !== 'evaluador') {
      // Si el rol no es ni empleado ni evaluador, lo sacamos por seguridad.
      router.push('/login'); 
    }
    // Si es 'evaluador', la lógica no hace nada y permite que se muestre el dashboard.

  }, [session, status, router]);

  // Mientras carga la sesión o si el usuario no es un evaluador (y está siendo redirigido),
  // mostramos un estado de carga para evitar mostrar contenido incorrecto.
  if (status === 'loading' || !session || session.user?.role !== 'evaluador') {
    return (
        <MainLayout>
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
            </div>
        </MainLayout>
    );
  }

  // Solo mostramos el dashboard si estamos seguros de que el usuario es un evaluador.
  return (
    <MainLayout>
      <div className="p-8 bg-brand-background text-brand-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h1 className="text-5xl font-bold tracking-tight">
              Bienvenido, <span className="text-brand-green">{session.user.name || "Evaluador"}</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Este es tu centro de control. Comienza por crear los recursos necesarios o dirígete a las acciones principales.
            </p>
          </div>

          <DashboardSection title="Paso 1: Creación y Configuración">
              <DashboardCard href="/empleados/nuevo" icon={UserPlus} title="Añadir Empleado">
                  Agrega un nuevo miembro del equipo al sistema de evaluaciones.
              </DashboardCard>
              <DashboardCard href="/oportunidades/nueva" icon={Lightbulb} title="Crear Oportunidad">
                  Registra una nueva oportunidad para asignarla a un empleado.
              </DashboardCard>
          </DashboardSection>

          <DashboardSection title="Paso 2: Acciones Principales">
              <DashboardCard href="/evaluaciones/nueva" icon={FilePenLine} title="Realizar Evaluación Semanal">
                  Accede al formulario para registrar un nuevo reporte de evaluación.
              </DashboardCard>
              <DashboardCard href="/oportunidades/listado" icon={Lock} title="Cerrar Oportunidades">
                  Gestiona y actualiza el estado de las oportunidades abiertas.
              </DashboardCard>
          </DashboardSection>

          <DashboardSection title="Paso 3: Consultas y Reportes">
              <DashboardCard href="/evaluaciones/panel" icon={ClipboardList} title="Panel de Rendimiento">
                  Analiza los reportes semanales acumulados por empleado.
              </DashboardCard>
              <DashboardCard href="/empleados" icon={Users} title="Ver Empleados">
                  Consulta y gestiona la lista completa de tus empleados.
              </DashboardCard>
              <DashboardCard href="/oportunidades/cerradas" icon={Archive} title="Historial de Oportunidades">
                  Consulta el archivo histórico de oportunidades completadas.
              </DashboardCard>
          </DashboardSection>
        </div>
      </div>
    </MainLayout>
  );
}