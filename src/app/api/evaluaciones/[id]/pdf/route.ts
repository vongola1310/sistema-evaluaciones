// src/app/api/evaluaciones/[id]/pdf/route.ts
import puppeteer from 'puppeteer-core'
import { NextResponse } from 'next/server'
import { join } from 'path'

const SECRET = 'XYZ123'

export async function GET(_: Request, context: { params: { id: string } }) {
  const id = parseInt(context.params.id, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const url = `http://localhost:3000/evaluaciones/reporte-html/${id}?pdf=true&secret=${SECRET}`

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: join(process.cwd(), 'chrome-win', 'chrome.exe'), // AJUSTA SI USAS OTRO PATH
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle0' })
    await new Promise(resolve => setTimeout(resolve, 1000)) // ✅


    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })

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
