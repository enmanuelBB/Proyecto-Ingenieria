"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css'; 
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

function RegisterForm() {
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault();
    setError(null);

    if (!name || !lastname || !email || !password) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name, 
            lastname,
            email, 
            password 
        }),
      });

      if (response.ok) {
        
        console.log('Registro exitoso.');
        router.push('/?registered=true'); 
      } else {
        setError('Error al registrarse. Verifique los datos o intente con otro correo.');
      }

    } catch (e) {
      console.error(e);
      setError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      
      <div className={styles.formGroup}>
        <label htmlFor="name">Nombre</label>
        <FaUser className={styles.inputIcon} />
        <input 
          type="text" 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          disabled={isLoading} 
          placeholder="Tu Nombre" 
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="lastname">Apellido</label>
        <FaUser className={styles.inputIcon} />
        <input 
          type="text" 
          id="lastname" 
          value={lastname} 
          onChange={(e) => setLastname(e.target.value)} 
          disabled={isLoading} 
          placeholder="Tu Apellido" 
        />
      </div>

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
        {isLoading ? 'Registrando...' : 'Crear Cuenta'} 
      </button>
      
      <div className={styles.formLinks}>
        <span style={{marginRight: '5px', color: '#64748b'}}>¿Ya tienes cuenta?</span>
        <a href="/">Inicia Sesión</a>
      </div>
    </form>
  );
}

export default RegisterForm;