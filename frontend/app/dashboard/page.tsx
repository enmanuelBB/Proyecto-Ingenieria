
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 1. Verificar si existe el token en el navegador
    // Nota: Usamos 'accessToken' porque así lo nombramos en el LoginForm
    const token = localStorage.getItem('accessToken');

    if (!token) {
      // Si no hay token, no debería estar aquí -> Redirigir al Login
      console.log("No hay token, redirigiendo al login...");
      router.push('/');
    } else {
      // Si hay token, permitimos ver la página
      setIsAuthenticated(true);
    }
  }, [router]);

  // Función para cerrar sesión
  const handleLogout = () => {
 
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    router.push('/');
  };

  // Evitamos un "flash" de contenido mostrando nada hasta verificar el token
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '3rem', 
      backgroundColor: '#f8fafc', 
      fontFamily: 'sans-serif',
      color: '#1e293b'
    }}>
      
      {/* Encabezado del Dashboard */}
      <header style={{ marginBottom: '3rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>
          Panel de Control
        </h1>
        <p style={{ color: '#64748b' }}>Sistema de Registro Clínico - Ingeniería Vital</p>
      </header>

      {/* Área de Acciones Rápidas */}
      <main>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          
          {/* Tarjeta 1 */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Nuevo Paciente</h3>
            <p style={{ marginBottom: '1rem', color: '#64748b' }}>Registrar un nuevo participante en el estudio.</p>
            <button style={actionButtonStyle}>+ Registrar</button>
          </div>

          {/* Tarjeta 2 */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>Ver Registros</h3>
            <p style={{ marginBottom: '1rem', color: '#64748b' }}>Consultar y filtrar la base de datos de encuestas.</p>
            <button style={secondaryButtonStyle}>Explorar</button>
          </div>

        </div>
      </main>

      {/* Botón de Cerrar Sesión Flotante */}
      <button 
        onClick={handleLogout}
        style={{ 
          position: 'fixed', 
          bottom: '2rem', 
          right: '2rem', 
          backgroundColor: '#ef4444', 
          color: 'white', 
          padding: '0.8rem 1.5rem', 
          border: 'none', 
          borderRadius: '8px', 
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}


const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  border: '1px solid #e2e8f0'
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: '600',
  marginBottom: '0.5rem',
  color: '#0f172a'
};

const actionButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#4f46e5', 
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '500'
};

const secondaryButtonStyle: React.CSSProperties = {
  ...actionButtonStyle,
  backgroundColor: 'white',
  color: '#4f46e5',
  border: '1px solid #4f46e5'
};