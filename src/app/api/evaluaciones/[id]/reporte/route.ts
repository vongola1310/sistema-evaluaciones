// src/app/api/evaluaciones/[id]/reporte/route.ts
import puppeteer from 'puppeteer' // ✅ Cambiar a puppeteer en lugar de puppeteer-core
import { NextResponse } from 'next/server'

const SECRET = 'XYZ123'

export async function GET(_: Request, context: { params: { id: string } }) {
  const id = parseInt(context.params.id, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    // ✅ Cambiar la URL para usar la página de resumen con los parámetros correctos
    const url = `http://localhost:3000/evaluaciones/resumen/${id}?pdf=true&secret=${SECRET}`

    const browser = await puppeteer.launch({
      headless: true,
      // ✅ Remover executablePath para usar Chrome incluido en puppeteer
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    
    // ✅ Configurar el viewport para mejor renderizado
    await page.setViewport({ width: 1200, height: 800 })
    
    await page.goto(url, { waitUntil: 'networkidle0' })
    
    // ✅ Esperar un poco más para que Tailwind se cargue completamente
    await new Promise(resolve => setTimeout(resolve, 2000))

    // ✅ Inyectar CSS para mejorar la impresión
    await page.addStyleTag({
      content: `
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Ocultar elementos de navegación en PDF */
          .no-print {
            display: none !important;
          }
          
          /* Ajustar márgenes para PDF */
          .min-h-screen {
            min-height: auto !important;
          }
          
          /* Mejorar contraste para PDF */
          .text-gray-300 {
            color: #6b7280 !important;
          }
          .text-gray-400 {
            color: #9ca3af !important;
          }
        }
      `
    })

    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    })

    await browser.close()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="evaluacion_${id}.pdf"`,
      },
    })
  } catch (err) {
    console.error('Error al generar el PDF con Puppeteer:', err)
    return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 })
  }
}