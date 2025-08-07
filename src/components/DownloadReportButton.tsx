'use client'

export function DownloadReportButton({ evaluationId }: { evaluationId: number }) {
  const handleDownload = async () => {
    try {
      // ✅ Cambiar la ruta a la nueva API
      const res = await fetch(`/api/evaluaciones/${evaluationId}/reporte`)
      
      if (!res.ok) {
        throw new Error('Error al generar el PDF')
      }
      
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `evaluacion_${evaluationId}.pdf`
      document.body.appendChild(a) // ✅ Agregar al DOM
      a.click()
      document.body.removeChild(a) // ✅ Limpiar el DOM

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al descargar PDF:', error)
      alert('Error al generar el PDF. Por favor, intenta nuevamente.')
    }
  }

  return (
    <button 
      onClick={handleDownload} 
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
    >
      📄 Descargar PDF
    </button>
  )
}