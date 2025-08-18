'use client'

import { useState, FormEvent, FC } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image' // Importamos el componente de Imagen
import { Mail, Lock, LogIn, AlertTriangle } from 'lucide-react'

// --- SUB-COMPONENTES DE DISEÑO (LIGHT MODE) ---

interface InputFieldProps {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ElementType;
  required?: boolean;
}

const InputField: FC<InputFieldProps> = ({ id, type, label, value, onChange, icon: Icon, required = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="block w-full rounded-md border-0 py-2.5 pl-10 bg-gray-100 text-brand-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green sm:text-sm"
      />
    </div>
  </div>
);

const Alert: FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center gap-3 rounded-md bg-red-100 p-3 text-sm text-red-700 border border-red-200">
    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
    <span>{message}</span>
  </div>
);

// --- COMPONENTE PRINCIPAL DE LOGIN ---

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.ok) {
        router.push('/dashboard');
      } else {
        setError(res?.error || 'Credenciales incorrectas. Por favor, inténtalo de nuevo.');
      }
    } catch (catchedError) {
        setError('Ocurrió un error inesperado. Inténtalo más tarde.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 text-brand-foreground">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo de la Empresa */}
        <Image
            src="/LOGO.png" // Asegúrate de que esta ruta sea correcta
            alt="Logo de Euroimmun"
            width={300}
            height={80}
            className="mx-auto"
            priority
        />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-800">
            Accede al Sistema de evaluación semanal 
            Inicia sesión
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-brand-background border border-brand-border shadow-lg rounded-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <InputField
              id="email"
              type="email"
              label="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />
            
            <InputField
              id="password"
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
            />

            {error && <Alert message={error} />}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center gap-2 rounded-md bg-brand-green px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Ingresar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}