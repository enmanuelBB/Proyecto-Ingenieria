import './globals.css';
import { Inter } from 'next/font/google'; 
import ThemeProvider from "./components/ThemeProvider"; 


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
      {/* 3. Aplicamos la clase de la fuente al body */}
      <body className={inter.className}>
        
        {/* Mantenemos el ThemeProvider para que funcione el modo oscuro */}
        <ThemeProvider>
            {children}
        </ThemeProvider>
        
      </body>
    </html>
  );
}