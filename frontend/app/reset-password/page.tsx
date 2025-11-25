
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaLock } from 'react-icons/fa';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // Capturamos el token de la URL

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validación básica
  useEffect(() => {
    if (!token) {
      setError('Token inválido o no proporcionado.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!token) return;

    setIsLoading(true);

    try {
      // Llamada al endpoint de reseteo
      const response = await fetch('http://localhost:8080/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            token: token, // Enviamos el token que vino del correo
            newPassword: newPassword 
        }),
      });

      if (response.ok) {
        setMessage('¡Contraseña actualizada con éxito! Redirigiendo...');
        setTimeout(() => router.push('/'), 3000); // Volver al login en 3 segundos
      } else {
        const data = await response.text();
        setError(data || 'El token ha expirado o es inválido.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return <div style={containerStyle}><p style={{color: 'red'}}>Error: Enlace inválido.</p></div>;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{marginBottom: '1.5rem', color: '#1e293b'}}>Crear Nueva Contraseña</h2>
        
        {message && <div style={successStyle}>{message}</div>}
        {error && <div style={errorStyle}>{error}</div>}

        {!message && (
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div style={{position: 'relative'}}>
                <FaLock style={iconStyle} />
                <input
                type="password"
                required
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
                minLength={4}
                />
            </div>
            <div style={{position: 'relative'}}>
                <FaLock style={iconStyle} />
                <input
                type="password"
                required
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
                />
            </div>
            
            <button type="submit" disabled={isLoading} style={buttonStyle}>
                {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
            </form>
        )}
      </div>
    </div>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}


const containerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' };
const cardStyle = { width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const inputStyle = { width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' };
const iconStyle = { position: 'absolute' as 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
const buttonStyle = { width: '100%', padding: '0.75rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const successStyle = { padding: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' };
const errorStyle = { padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' };