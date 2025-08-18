import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans'; // ✅ Importación correcta
import { GeistMono } from 'geist/font/mono';   // ✅ Importación correcta
import SessionWrapper from "@/components/SessionWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema de Evaluaciones",
  description: "Creado para la gestión de evaluaciones de oportunidades.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Aplicamos las fuentes como variables CSS en la etiqueta <html>
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}