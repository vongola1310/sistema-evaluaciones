'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, FC } from 'react'
import { LogOut, X, Menu as MenuIcon, Bell } from 'lucide-react'

// --- INTERFACES Y DATOS ---
const navItems = [
  { href: '/empleados', label: 'Empleados' },
  { href: '/evaluaciones/panel', label: 'Panel' },
  { href: '/oportunidades/listado', label: 'Oportunidades' },
]
interface Notification {
    id: number;
    message: string;
    link: string;
    read: boolean;
    createdAt: string;
}

// --- SUB-COMPONENTE PARA EL DROPDOWN DE NOTIFICACIONES ---
const NotificationsDropdown: FC<{
    notifications: Notification[],
    onNotificationClick: (link: string) => void
}> = ({ notifications, onNotificationClick }) => (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-brand-background border border-brand-border rounded-lg shadow-xl">
        <div className="p-3 font-semibold text-sm text-brand-foreground border-b border-brand-border">
            Notificaciones
        </div>
        <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
                notifications.map(n => (
                    <div 
                        key={n.id} 
                        onClick={() => onNotificationClick(n.link)} 
                        className={`p-3 border-b border-brand-border last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                            !n.read ? 'bg-green-50' : ''
                        }`}
                    >
                        <p className={`text-sm ${!n.read ? 'font-semibold text-brand-foreground' : 'text-gray-500'}`}>
                            {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.createdAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                    </div>
                ))
            ) : (
                <p className="p-4 text-sm text-center text-gray-500">No tienes notificaciones.</p>
            )}
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL DE NAVBAR ---
export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (session?.user?.role === 'employee') {
      const fetchNotifications = async () => {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      }
      fetchNotifications();
    }
  }, [session]);

  const handleOpenNotifications = async () => {
    const willBeOpen = !isNotificationsOpen;
    setIsNotificationsOpen(willBeOpen);
    if (willBeOpen && unreadCount > 0) {
        setTimeout(() => {
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        }, 1000);
        await fetch('/api/notifications', { method: 'PATCH' });
    }
  }

  const handleNotificationClick = (link: string) => {
    setIsNotificationsOpen(false);
    router.push(link);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setIsNotificationsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null

  const handleSignOut = () => signOut({ callbackUrl: '/login' })

  return (
    <nav className="sticky top-0 z-50 bg-brand-background/80 backdrop-blur-lg border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={200} height={80} priority />
          </Link>

          {session.user.role === 'evaluador' && (
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => ( <Link key={item.href} href={item.href} className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === item.href ? 'text-brand-foreground font-semibold' : 'text-gray-500 hover:text-brand-foreground'}`}> {item.label} {pathname === item.href && ( <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 bg-brand-green rounded-full"></span> )} </Link> ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            {session.user.role === 'employee' && (
              <div className="relative" ref={notificationsRef}>
                <button onClick={handleOpenNotifications} className="relative text-gray-500 hover:text-brand-foreground p-2 rounded-full hover:bg-gray-100">
                  <Bell size={20}/>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                  )}
                </button>
                {isNotificationsOpen && (
                  <NotificationsDropdown notifications={notifications} onNotificationClick={handleNotificationClick} />
                )}
              </div>
            )}
            
            {/* ✅ SECCIÓN DEL MENÚ DE USUARIO RESTAURADA */}
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
                    <p className="text-sm text-brand-foreground font-semibold truncate">{session.user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{session.user?.role}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 transition-colors"
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
      
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-brand-border bg-brand-background">
          <div className="flex flex-col gap-1">
            {session.user.role === 'evaluador' && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-base font-medium ${pathname === item.href ? 'bg-brand-green/10 text-brand-green font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
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