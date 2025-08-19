import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// Asegura que esta ruta se ejecute dinámicamente en el servidor cada vez que se llama.
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const reportId = params.id;
  
  // Construye la URL completa de la página que queremos convertir a PDF.
  const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

  // Se asegura de que la variable de entorno se haya cargado.
  if (!process.env.PDF_ACCESS_SECRET) {
    console.error('La clave secreta para PDF (PDF_ACCESS_SECRET) no está configurada en .env.local');
    return NextResponse.json({ error: 'Configuración del servidor incompleta.' }, { status: 500 });
  }

  // Construye la URL con la clave secreta para saltar la autenticación.
  const reportUrl = `${baseUrl}/evaluaciones/resumen/${reportId}?secret=${process.env.PDF_ACCESS_SECRET}`;

  let browser = null;

  try {
    // 1. Inicia una instancia de un navegador Chrome invisible (headless).
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Opciones para compatibilidad en servidores.
    });

    const page = await browser.newPage();
    
    // 2. El navegador "visita" la página de tu reporte.
    await page.goto(reportUrl, {
      waitUntil: 'networkidle0', // Espera a que la página cargue completamente.
    });

    // 3. Genera el PDF a partir del contenido HTML de la página.
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Crucial para que los colores y fondos del diseño se impriman.
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    // 4. Convertimos explícitamente a un Buffer de Node.js para máxima compatibilidad.
    const buffer = Buffer.from(pdfBuffer);

    // 5. Se envía la respuesta al navegador del usuario.
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-semanal-${reportId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    return NextResponse.json(
      { error: 'No se pudo generar el PDF.' },
      { status: 500 }
    );
  } finally {
    // 6. Asegura que el navegador invisible siempre se cierre para liberar recursos.
    if (browser) {
      await browser.close();
    }
  }
}