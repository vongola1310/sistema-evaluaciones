// src/components/DownloadReportButton.tsx
'use client'

import { useState } from 'react'

export function DownloadReportButton({ evaluationId }: { evaluationId: number }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)

    try {
      const res = await fetch(`/api/evaluaciones/${evaluationId}/pdf`)

      if (!res.ok) {
        throw new Error('No se pudo generar el PDF')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `evaluacion_${evaluationId}.pdf`
      a.click()

      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error al descargar PDF:', err)
      alert('Ocurrió un error al generar el PDF.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`px-4 py-2 rounded text-white transition ${
        loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
      }`}
    >
      {loading ? 'Generando...' : 'Descargar PDF'}
    </button>
  )
}
