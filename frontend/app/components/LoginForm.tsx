// Ubicación: components/LoginForm.tsx
"use client";

import React, { useState } from 'react';
import styles from './LoginForm.module.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault();
    setError(null);

    if (isLoading || !email || !password) {
      setError('Por favor, complete ambos campos.');
      return;
    }

    setIsLoading(true);

    // --- Simulación de llamada al Backend ---
    console.log('Enviando credenciales:', { email, password });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      if (email === "medico@gmail.com" && password === "seguro") {
        console.log('Login exitoso!');
      } else {
        setError('Credenciales incorrectas. Verifique su email y contraseña.');
      }
    } catch (e) {
      setError('Error de conexión. Intente más tarde.');
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      
      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <FaEnvelope className={styles.inputIcon} />
        <input 
          type="email" 
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          placeholder="ej: medico@gmail.com"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password">Contraseña</label>
        <FaLock className={styles.inputIcon} />
        <input 
          type="password" 
          id="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          placeholder="••••••••••"
        />
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? 'Ingresando...' : 'Ingresar'} 
      </button>
      
      <div className={styles.formLinks}>
        <a href="/olvide-password">Olvidé mi contraseña</a>
      </div>
    </form>
  );
}

export default LoginForm;