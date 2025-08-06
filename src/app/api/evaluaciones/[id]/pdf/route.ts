// src/app/api/evaluaciones/[id]/pdf/route.ts

import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function GET(request: Request, context: { params: { id: string } }) {
  const id = parseInt(context.params.id, 10)
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const url = `http://localhost:3000/evaluaciones/resumen/${id}?pdf=true`

  try {
    const browser = await puppeteer.launch({
      headless: true,
      // Puedes omitir `executablePath` porque puppeteer ya trae Chromium
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    })

    await browser.close()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="evaluacion_${id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error al generar el PDF con Puppeteer:', error)
    return NextResponse.json({ error: 'Error al generar PDF' }, { status: 500 })
  }
}
