import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { get } from "http"
import { redirect } from "next/navigation"


export default async function DashboardEvaluador(){
    const session = await getServerSession(authOptions)

    if(!session){
        redirect("/login")
    }

    if(session.user.role !== "evaluador"){
        redirect("/")
    }
    return(
         <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">
          Bienvenido, {session.user.name || "Evaluador"}
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Bloque 1: Consultar Evaluaciones */}
          <Link href="/evaluaciones/panel" className="block bg-gray-800 p-6 rounded-2xl shadow hover:bg-gray-700 transition-all duration-200 group">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-green-400 transition-all">Consultar evaluaciones por empleado</h2>
            <p className="text-gray-400">Revisa el historial de evaluaciones de cada empleado.</p>
          </Link>

          {/* Bloque 2: Evaluar empleados */}
          <Link href="/empleados/nuevo" className="block bg-gray-800 p-6 rounded-2xl shadow hover:bg-gray-700 transition-all duration-200 group">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-green-400 transition-all">Evaluar empleados</h2>
            <p className="text-gray-400">Accede al listado de empleados y comienza una nueva evaluación.</p>
          </Link>

           {/* Bloque 3: Crear Oportunidad */}
          <Link href="/oportunidades/nueva" className="block bg-gray-800 p-6 rounded-2xl shadow hover:bg-gray-700 transition-all duration-200 group">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-green-400 transition-all">Crear oportunidad</h2>
            <p className="text-gray-400">Accede al formulario para crear una nueva oportunidad para despues agregarsela al empleado</p>
          </Link>

          {/* Bloque 4: Crear Empleado */}
          <Link href="/empleados/nuevo" className="block bg-gray-800 p-6 rounded-2xl shadow hover:bg-gray-700 transition-all duration-200 group">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-green-400 transition-all">Crea un empleado</h2>
            <p className="text-gray-400">Se aumento la plantilla no hay problema agrega al empleado al sistema de avaluacionez</p>
          </Link>

          {/*Bloque 5 Ver lista de emplados   */}
          <Link href="/empleados" className="block bg-gray-800 p-6 rounded-2xl shadow hover:bg-gray-700 transition-all duration-200 group">
            <h2 className="text-xl font-semibold mb-2 group-hover:text-green-400 transition-all">Ver listado de empleados</h2>
            <p className="text-gray-400">Ve a tus empleados</p>
          </Link>



        </div>
      </div>
    </div>
         
    )
}


