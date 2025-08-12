'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation' // Hook para saber la ruta actual
import { useState, useEffect, useRef } from 'react'
import { LayoutGrid, LogOut, X, Menu as MenuIcon } from 'lucide-react' // Iconos

// 1. Definimos los elementos de navegación en un array para no repetir código
const navItems = [
  { href: '/empleados', label: 'Empleados' },
  { href: '/evaluaciones/panel', label: 'Evaluaciones' },
  { href: '/oportunidades/listado', label: 'Oportunidades' },
]

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname() // Obtenemos la ruta actual

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Efecto para cerrar el menú de usuario si se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuRef]);


  if (!session) return null

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    // Estilo "Glassmorphism": fondo oscuro semitransparente con desenfoque
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo/Título */}
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-white hover:text-green-400 transition-colors">
            <LayoutGrid className="text-green-400" />
            <span>Sistema</span>
          </Link>

          {/* Links del centro - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${pathname === item.href 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                {item.label}
                {/* Indicador de vínculo activo con animación */}
                {pathname === item.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 bg-green-400 rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Lado derecho: Menú de Usuario y Menú Móvil */}
          <div className="flex items-center gap-4">
            {/* Menú de Usuario (Dropdown) */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-white/10"
              >
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm text-white font-medium">
                  {session.user?.name || 'Usuario'}
                </span>
              </button>
              
              {/* Contenido del Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-lg py-1">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm text-white font-semibold">{session.user?.name}</p>
                    <p className="text-xs text-gray-400">{session.user?.role}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut size={16} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Botón menú móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-white/10">
          <div className="flex flex-col gap-1">
            {/* Usamos el mismo array de items para el menú móvil */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  px-3 py-2 rounded-md text-base font-medium
                  ${pathname === item.href ? 'bg-green-500/10 text-green-300' : 'text-gray-300 hover:bg-white/5'}
                `}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}