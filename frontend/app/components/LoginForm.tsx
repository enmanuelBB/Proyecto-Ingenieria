
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import styles from './LoginForm.module.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter(); 

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault();
    setError(null);

    if (isLoading || !email || !password) {
      setError('Por favor, complete ambos campos.');
      return;
    }

    setIsLoading(true);

    try {
      // peticion al backend
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            email: email, 
            password: password 
        }),
      });

      if (response.ok) {
        // Si la respuesta es exitosa (200 OK)
        const data = await response.json();
        
        // Guardamos los tokens que nos envía el backend
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        
        console.log('Login exitoso, tokens guardados.');
        
        // Redirigir al usuario (por ejemplo, al dashboard o home)
      
        router.push('/dashboard'); 
      } else {
        // Si las credenciales están mal (403/401)
        setError('Credenciales incorrectas. Verifique su email y contraseña.');
      }

    } catch (e) {
      console.error(e);
      setError('Error de conexión. Asegúrese de que el backend esté corriendo.');
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