'use client'

import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, LogIn, AlertTriangle, LayoutGrid } from 'lucide-react'

// --- SUB-COMPONENTES DE DISEÑO ---

/**
 * InputField: Un componente reutilizable para los campos del formulario con icono.
 */
interface InputFieldProps {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ElementType;
  required?: boolean;
}

const InputField = ({ id, type, label, value, onChange, icon: Icon, required = false }: InputFieldProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300">
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
        className="block w-full rounded-md border-0 py-2.5 pl-10 bg-gray-700/50 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-500 sm:text-sm"
      />
    </div>
  </div>
);

/**
 * Alert: Un componente para mostrar mensajes de error de forma destacada.
 */
const Alert = ({ message }: { message: string }) => (
  <div className="flex items-center gap-3 rounded-md bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
    <span>{message}</span>
  </div>
);


// --- COMPONENTE PRINCIPAL DE LOGIN ---

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para feedback en el botón
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Inicia la carga
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
        // Usamos el mensaje de error que devuelve NextAuth o uno por defecto
        setError(res?.error || 'Credenciales incorrectas. Por favor, inténtalo de nuevo.');
      }
    } catch (catchedError) {
        setError('Ocurrió un error inesperado. Inténtalo más tarde.');
    } finally {
        setIsLoading(false); // Finaliza la carga
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo y Título */}
        <div className="flex justify-center items-center gap-3">
            <LayoutGrid className="h-10 w-auto text-green-400" />
            <h2 className="text-center text-3xl font-bold leading-9 tracking-tight text-white">
                Sistema de Evaluaciones
            </h2>
        </div>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800/50 border border-white/10 shadow-xl rounded-2xl p-8">
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
                className="flex w-full justify-center items-center gap-2 rounded-md bg-green-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
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