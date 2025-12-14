"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import styles from './forgotPassword.module.css';

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
      const response = await fetch('http://localhost:8080/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.');
      } else {
        setError('Hubo un problema al procesar tu solicitud. Verifica el correo.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: '50%' }}>
                <FaEnvelope size={24} color="var(--primary)" />
            </div>
        </div>
        
        <h2 className={styles.title}>Recuperar Cuenta</h2>
        <p className={styles.description}>
          Ingresa tu correo institucional y te enviaremos las instrucciones para restablecer tu acceso.
        </p>

        {message && <div className={styles.message}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.icon} />
            <input
              type="email"
              required
              placeholder="correo@institucion.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>
          
          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
          </button>
        </form>

        <div className={styles.backLink}>
          <Link href="/" className={styles.link}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <FaArrowLeft size={12} /> Volver al inicio de sesión
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}