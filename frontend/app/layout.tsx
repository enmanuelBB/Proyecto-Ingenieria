// Ubicación: app/layout.tsx

import './globals.css';
import { Inter } from 'next/font/google'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Ingenieria Vital | Acceso',
  description: 'Sistema de Registro de Pacientes para Estudio Clínico',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body> 
    </html>
  );
}