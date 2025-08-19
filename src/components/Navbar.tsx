'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image' // ✅ Importamos el componente de Imagen
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { LogOut, X, Menu as MenuIcon } from 'lucide-react'

const navItems = [
  { href: '/empleados', label: 'Empleados' },
  { href: '/evaluaciones/panel', label: 'Panel' },
  { href: '/oportunidades/listado', label: 'Oportunidades' },
]

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    // ✅ Navbar con fondo blanco, semitransparente y borde sutil
    <nav className="sticky top-0 z-50 bg-brand-background/80 backdrop-blur-lg border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* ✅ Logo/Título a la izquierda */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/LOGO.png" // ❗ IMPORTANTE: Usa el nombre exacto de tu archivo de imagen
              alt="Logo de Euroimmun"
              width={250} // Ajusta el ancho según necesites
              height={60} // Ajusta el alto según necesites
              priority // Carga la imagen más rápido
            />
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
                    ? 'text-brand-foreground font-semibold' // Letra oscura para el activo
                    : 'text-gray-500 hover:text-brand-foreground'
                  }
                `}
              >
                {item.label}
                {pathname === item.href && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 bg-brand-green rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Lado derecho: Menú de Usuario y Menú Móvil */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-gray-200/50"
              >
                <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm text-brand-foreground font-medium">
                  {session.user?.name || 'Usuario'}
                </span>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-brand-background border border-brand-border rounded-lg shadow-lg py-1">
                  <div className="px-4 py-2 border-b border-brand-border">
                    <p className="text-sm text-brand-foreground font-semibold">{session.user?.name}</p>
                    <p className="text-xs text-gray-500">{session.user?.role}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-500/10"
                  >
                    <LogOut size={16} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-500 hover:text-brand-foreground"
            >
              {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-brand-border bg-brand-background">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  px-3 py-2 rounded-md text-base font-medium
                  ${pathname === item.href ? 'bg-brand-green/10 text-brand-green font-semibold' : 'text-gray-600 hover:bg-gray-100'}
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