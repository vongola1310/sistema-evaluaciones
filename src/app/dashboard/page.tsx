'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from "@/components/MainLayout"
import type { FC, ReactNode } from "react";

// Importa los iconos que vamos a usar
import {
  ClipboardList,
  FilePenLine,
  Lightbulb,
  UserPlus,
  Users,
  Archive,
  Lock,
  TrendingUp,
  BarChart,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// --- SUB-COMPONENTES DE DISEÑO ---

const DashboardCard: FC<{ href: string, icon: any, title: string, children: ReactNode, featured?: boolean }> = ({ 
    href, 
    icon: Icon, 
    title, 
    children, 
    featured = false 
}) => {
    return (
        <Link
            href={href}
            className={`group relative block overflow-hidden rounded-2xl transition-all duration-500 ease-out transform hover:scale-[1.02] hover:-translate-y-2 ${
                featured 
                    ? "bg-gradient-to-br from-brand-green/10 via-brand-card to-brand-green/5 border-2 border-brand-green/30 shadow-xl hover:shadow-brand-green/30"
                    : "bg-brand-card border border-brand-border/50 shadow-lg hover:border-brand-green/50 hover:shadow-brand-green/10"
            }`}
        >
            {/* Efecto de brillo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            
            {/* Contenido principal */}
            <div className="relative p-6 h-full">
                <div className="flex h-full flex-col justify-between gap-6">
                    <div className="flex items-start justify-between">
                        <div className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 ${
                            featured 
                                ? "bg-brand-green/20 text-brand-green shadow-lg" 
                                : "bg-brand-green/10 text-brand-green group-hover:bg-brand-green/20 group-hover:scale-110"
                        }`}>
                            <Icon className="h-6 w-6" />
                        </div>
                        {featured && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-brand-green/20 rounded-full">
                                <Sparkles className="h-3 w-3 text-brand-green" />
                                <span className="text-xs font-medium text-brand-green">Destacado</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-grow">
                        <h3 className={`font-bold mb-3 transition-colors duration-300 ${
                            featured 
                                ? "text-xl text-brand-foreground" 
                                : "text-lg text-brand-foreground group-hover:text-brand-green"
                        }`}>
                            {title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4">
                            {children}
                        </p>
                    </div>
                    
                    <div className="flex items-center text-brand-green font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
                        <span>Acceder</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                </div>
            </div>
        </Link>
    );
};

const DashboardSection: FC<{ title: string, subtitle?: string, children: ReactNode }> = ({ title, subtitle, children }) => (
    <section className="mb-16">
        <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
                <div className="h-1 w-12 bg-gradient-to-r from-brand-green to-brand-green/50 rounded-full"></div>
                <h2 className="text-3xl font-bold tracking-tight text-brand-foreground">
                    {title}
                </h2>
            </div>
            {subtitle && (
                <p className="text-gray-600 text-lg ml-16">{subtitle}</p>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {children}
        </div>
    </section>
);

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
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
            <div className="flex justify-center items-center h-screen bg-brand-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-green/30 border-t-brand-green mx-auto mb-6"></div>
                    <p className="text-brand-foreground font-medium">Cargando dashboard...</p>
                </div>
            </div>
        </MainLayout>
    );
  }

  // Solo mostramos el dashboard si estamos seguros de que el usuario es un evaluador.
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-brand-background via-brand-background to-brand-green/5">
        {/* Header mejorado */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-background via-brand-background to-brand-green/10 border-b border-brand-border/50">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          <div className="relative max-w-7xl mx-auto px-8 py-16">
            <div className="flex items-center gap-6 mb-6">
              <div className="p-4 bg-brand-green/20 rounded-2xl">
                <div className="w-12 h-12 bg-brand-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {session.user?.name?.charAt(0) || "E"}
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold tracking-tight text-brand-foreground">
                  Bienvenido, <span className="text-brand-green">{session.user.name || "Evaluador"}</span>
                </h1>
                <p className="mt-3 text-xl text-gray-600 font-medium">
                  Tu centro de control para la gestión y evaluación de equipos
                </p>
              </div>
            </div>
            
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-brand-foreground">Empleados</p>
                    <p className="text-gray-600 text-sm">Gestión activa</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-brand-foreground">Evaluaciones</p>
                    <p className="text-gray-600 text-sm">En progreso</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-brand-foreground">Oportunidades</p>
                    <p className="text-gray-600 text-sm">Disponibles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-8 py-16">
          <DashboardSection 
            title="Creación y Configuración" 
            subtitle="Configura los elementos básicos de tu sistema de evaluaciones"
          >
              <DashboardCard href="/empleados/nuevo" icon={UserPlus} title="Añadir Empleado">
                  Agrega un nuevo miembro del equipo al sistema de evaluaciones.
              </DashboardCard>
              <DashboardCard href="/oportunidades/nueva" icon={Lightbulb} title="Crear Oportunidad">
                  Registra una nueva oportunidad para asignarla a un empleado.
              </DashboardCard>
          </DashboardSection>

          <DashboardSection 
            title="Acciones Principales" 
            subtitle="Herramientas principales para la evaluación y seguimiento"
          >
              <DashboardCard href="/evaluaciones/nueva" icon={FilePenLine} title="Realizar Evaluación Semanal" featured>
                  Accede al formulario para registrar un nuevo reporte de evaluación de oportunidades.
              </DashboardCard>
              <DashboardCard href="/evaluaciones/mensuales/nueva" icon={TrendingUp} title="Evaluación Mensual Comercial" featured>
                  Registra la rúbrica de desempeño comercial para un empleado.
              </DashboardCard>
              <DashboardCard href="/oportunidades/listado" icon={Lock} title="Cerrar Oportunidades">
                  Gestiona y actualiza el estado de las oportunidades abiertas.
              </DashboardCard>
          </DashboardSection>

          <DashboardSection 
            title="Consultas y Reportes" 
            subtitle="Analiza el rendimiento y consulta históricos detallados"
          >
              <DashboardCard href="/evaluaciones/panel" icon={ClipboardList} title="Panel de Rendimiento Semanal">
                  Analiza los reportes de seguimiento de oportunidades.
              </DashboardCard>
              <DashboardCard href="/evaluaciones/mensuales/panel" icon={BarChart} title="Panel de Desempeño Mensual">
                  Consulta y filtra las rúbricas de desempeño comercial.
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