"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import styles from './resetPassword.module.css';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await fetch('http://localhost:8080/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            token: token, 
            newPassword: newPassword 
        }),
      });

      if (response.ok) {
        setMessage('¡Contraseña actualizada con éxito! Redirigiendo al inicio...');
        setTimeout(() => router.push('/'), 3000);
      } else {
        const data = await response.text();
        setError(data || 'El token ha expirado o es inválido.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
      return (
        <div className={styles.container}>
            <div className={styles.card} style={{ textAlign: 'center' }}>
                <div className={styles.error} style={{ marginBottom: 0 }}>
                    Error: Enlace inválido o incompleto.
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        {/* Header Visual Opcional */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: '50%' }}>
                <FaLock size={24} color="var(--primary)" />
            </div>
        </div>

        <h2 className={styles.title}>Crear Nueva Contraseña</h2>
        
        {message && (
            <div className={styles.message} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCheckCircle /> {message}
            </div>
        )}
        
        {error && <div className={styles.error}>{error}</div>}

        {!message && (
            <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
                <FaLock className={styles.icon} />
                <input
                type="password"
                required
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                minLength={4}
                />
            </div>
            <div className={styles.inputGroup}>
                <FaLock className={styles.icon} />
                <input
                type="password"
                required
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                />
            </div>
            
            <button type="submit" disabled={isLoading} className={styles.button}>
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
    <Suspense fallback={<div className={styles.container}><div className={styles.loading}>Cargando...</div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}