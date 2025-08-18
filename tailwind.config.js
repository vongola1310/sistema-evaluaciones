/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ✅ Paleta de colores corporativa actualizada
        'brand-green': '#74C054', // El nuevo verde que solicitaste
        'brand-background': '#FFFFFF', // Fondo blanco
        'brand-foreground': '#1F2937', // Texto oscuro (gris-800)
        'brand-card': '#F9FAFB', // Un gris muy claro para el fondo de las tarjetas (gris-50)
        'brand-border': '#E5E7EB', // Un color de borde sutil (gris-200)
      },
    },
  },
  plugins: [],
}