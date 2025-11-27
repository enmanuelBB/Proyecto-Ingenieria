
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import styles from './LoginForm.module.css';
import { FaEnvelope, FaLock, FaKey } from 'react-icons/fa';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState(''); 
  const [showVerification, setShowVerification] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  const router = useRouter(); 

  // 1. Generar o recuperar un ID único para este dispositivo al cargar la página
  useEffect(() => {
    let storedDeviceId = localStorage.getItem('deviceId');
    if (!storedDeviceId) {
      // Generamos un ID aleatorio simple si no existe
      storedDeviceId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      localStorage.setItem('deviceId', storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);

  // --- PASO 1: Intentar Iniciar Sesión ---
  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceId }), 
      });

      // 1. VERIFICAMOS PRIMERO SI HUBO ERROR DE CREDENCIALES
      if (response.status === 403 || response.status === 401) {
        setError('Credenciales incorrectas. Verifique su email y contraseña.');
        setIsLoading(false);
        return; // Nos detenemos aquí, no intentamos leer JSON
      }

      // 2. Si no es 403/401, verificamos si la respuesta fue exitosa en general
      if (!response.ok) {
        setError('Ocurrió un error en el servidor. Intente más tarde.');
        setIsLoading(false);
        return;
      }

      // 3. Solo si es exitosa (200 OK), leemos el JSON
      const data = await response.json();

      if (data.mfa_enabled) {
        setShowVerification(true);
      } else {
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        router.push('/dashboard'); 
      }

    } catch (e) {
      console.error(e);
      // Este mensaje solo saldrá si el backend está apagado o hay error de red real
      setError('Error de conexión. Asegúrese de que el backend esté corriendo.');
    } finally {
      // Aseguramos que el loading se apague si no se apagó antes
      if (window.location.pathname === '/') setIsLoading(false); 
    }
  };

  // --- PASO 2: Verificar el Código del Correo ---
  const handleVerifySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Llamamos al endpoint de verificación
      const response = await fetch('http://localhost:8080/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email, 
            code: verificationCode, 
            deviceId, 
            rememberDevice: true // Le decimos que recuerde este dispositivo
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Código correcto -> Guardamos tokens y entramos
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        console.log('Verificación exitosa.');
        router.push('/dashboard');
      } else {
        setError('Código incorrecto o expirado. Intente nuevamente.');
      }
    } catch (e) {
      console.error(e);
      setError('Error al verificar el código.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDERIZADO CONDICIONAL ---

  // PANTALLA 2: Ingresar Código de Verificación
  if (showVerification) {
    return (
        <form className={styles.loginForm} onSubmit={handleVerifySubmit}>
            <h3 style={{textAlign:'center', color:'#333', marginBottom:'1rem', fontSize:'1.2rem'}}>
              Verificación Requerida
            </h3>
            <p style={{textAlign:'center', color:'#666', fontSize:'0.9rem', marginBottom:'1.5rem'}}>
                Hemos enviado un código a <strong>{email}</strong> porque es un nuevo dispositivo.
            </p>

            <div className={styles.formGroup}>
                <label htmlFor="code">Código de Verificación</label>
                <FaKey className={styles.inputIcon} />
                <input 
                    type="text" 
                    id="code" 
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={isLoading}
                    placeholder="123456"
                    style={{letterSpacing: '4px', textAlign: 'center', paddingLeft: '2.5rem'}}
                />
            </div>

            {error && <p className={styles.formError}>{error}</p>}

            <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? 'Verificando...' : 'Validar Código'}
            </button>
            
            <div style={{marginTop: '1rem', textAlign: 'center'}}>
              <button 
                type="button" 
                onClick={() => setShowVerification(false)}
                style={{background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', textDecoration: 'underline'}}
              >
                Volver atrás
              </button>
            </div>
        </form>
    );
  }

  // PANTALLA 1: Login Normal (Usuario y Contraseña)
  return (
    <form className={styles.loginForm} onSubmit={handleLoginSubmit}>
      
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