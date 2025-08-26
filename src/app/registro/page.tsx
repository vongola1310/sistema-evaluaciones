// /src/app/registro/page.tsx
'use client'

import { useState, FormEvent, FC, ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { UserPlus, Hash, Mail, Lock, User } from 'lucide-react'

// Reutilizamos el componente de InputField que ya hemos diseñado
const InputField: FC<{ id: string, type: string, label: string, value: string, onChange: (e: ChangeEvent<HTMLInputElement>) => void, icon: any, required?: boolean, placeholder?: string }> = 
({ id, type, label, value, onChange, icon: Icon, required = false, placeholder = '' }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input id={id} name={id} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="block w-full rounded-md border-0 py-2.5 pl-10 bg-gray-50 text-brand-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green sm:text-sm"
      />
    </div>
  </div>
);

export default function RegistroPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeNo, setEmployeeNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading('Creando tu cuenta...');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, employeeNo }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo crear la cuenta.');
      }
      toast.success('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.', { id: loadingToast });
      router.push('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ocurrió un error', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 text-brand-foreground">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image src="/logo.png" alt="Logo" width={300} height={80} className="mx-auto" priority />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-800">
          Activa tu cuenta de empleado
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ¿Ya tienes una?{' '}
          <Link href="/login" className="font-semibold text-brand-green hover:text-green-700">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-brand-background border border-brand-border shadow-lg rounded-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <InputField id="name" type="text" label="Nombre Completo" value={name} onChange={(e) => setName(e.target.value)} icon={User} required />
            <InputField id="employeeNo" type="text" label="Número de Empleado (ID)" value={employeeNo} onChange={(e) => setEmployeeNo(e.target.value)} icon={Hash} required placeholder="Ej: 33126" />
            <InputField id="email" type="email" label="Correo Electrónico (para tu cuenta)" value={email} onChange={(e) => setEmail(e.target.value)} icon={Mail} required />
            <InputField id="password" type="password" label="Crea una Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} icon={Lock} required />
            <div>
              <button type="submit" disabled={isSubmitting} className="flex w-full justify-center items-center gap-2 rounded-md bg-brand-green px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:bg-gray-400">
                {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}