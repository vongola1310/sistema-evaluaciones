// src/components/DeleteEmployeeButton.tsx

"use client" // ¡Muy importante! Esto lo marca como un componente de cliente.

import { useRouter } from 'next/navigation'

interface DeleteButtonProps {
  employeeId: number
}

export default function DeleteEmployeeButton({ employeeId }: DeleteButtonProps) {
  const router = useRouter()

  const handleDelete = async () => {
    // Pedimos confirmación antes de eliminar
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar a este empleado?")

    if (!confirmed) {
      return // Si el usuario cancela, no hacemos nada
    }

    try {
      const response = await fetch(`/api/empleados/${employeeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        // Si la API devuelve un error, lo mostramos
        const data = await response.json()
        alert(data.error || 'No se pudo eliminar al empleado.')
        return
      }

      // Si todo sale bien, refrescamos la página para que la lista se actualice
      // router.refresh() es la forma moderna en Next.js App Router para volver a cargar los datos del servidor.
      router.refresh()

    } catch (error) {
      console.error('Error en el cliente al eliminar:', error)
      alert('Ocurrió un error al intentar conectar con el servidor.')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold shadow"
    >
      🗑️ Eliminar
    </button>
  )
}