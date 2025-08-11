'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar(){
    const { data: session } = useSession()
    const [isMenuOpen, setIsMenuOpen]=useState(false)

    if(!session) return null

    const handleSignOut = () =>{
        signOut({callbackUrl:'/login'})
    }

    return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo/Título */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-green-400 hover:text-green-300">
              Sistema Evaluaciones
            </Link>
          </div>

          {/* Links del centro - Solo en pantallas grandes */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/empleados" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Empleados
            </Link>
            <Link 
              href="/evaluaciones/panel" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Evaluaciones
            </Link>
            <Link 
              href="/oportunidades/listado" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Oportunidades
            </Link>
          </div>

          {/* Usuario y Cerrar sesión */}
          <div className="flex items-center space-x-4">
            
            {/* Info del usuario */}
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-gray-300">
                <div className="font-medium">{session.user?.name || 'Usuario'}</div>
                <div className="text-xs text-gray-400">{session.user?.role || 'evaluador'}</div>
              </div>
            </div>

            {/* Botón cerrar sesión */}
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Cerrar sesión
            </button>

            {/* Botón menú móvil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col space-y-2">
              <Link 
                href="/dashboard" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/empleados" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Empleados
              </Link>
              <Link 
                href="/evaluaciones/panel" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Evaluaciones
              </Link>
              <Link 
                href="/oportunidades/listado" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Oportunidades
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )

}