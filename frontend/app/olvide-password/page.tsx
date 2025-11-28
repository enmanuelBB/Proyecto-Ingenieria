"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope } from 'react-icons/fa';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      // Llamada al endpoint 
      const response = await fetch('http://localhost:8080/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), //
      });

      if (response.ok) {
        setMessage('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.');
      } else {
        setError('Hubo un problema al procesar tu solicitud.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{marginBottom: '1rem', color: '#1e293b'}}>Recuperar Cuenta</h2>
        <p style={{marginBottom: '1.5rem', color: '#64748b', fontSize: '0.9rem'}}>
          Ingresa tu correo institucional y te enviaremos un enlace para crear una nueva contraseña.
        </p>

        {message && <div style={successStyle}>{message}</div>}
        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div style={{position: 'relative'}}>
            <FaEnvelope style={iconStyle} />
            <input
              type="email"
              required
              placeholder="ej: medico@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>
          
          <button type="submit" disabled={isLoading} style={buttonStyle}>
            {isLoading ? 'Enviando...' : 'Enviar Enlace'}
          </button>
        </form>

        <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
          <Link href="/" style={{color: '#4f46e5', fontSize: '0.9rem', textDecoration: 'none'}}>
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}


const containerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' };
const cardStyle = { width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const inputStyle = { width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' };
const iconStyle = { position: 'absolute' as 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };
const buttonStyle = { width: '100%', padding: '0.75rem', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const successStyle = { padding: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' };
const errorStyle = { padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' };