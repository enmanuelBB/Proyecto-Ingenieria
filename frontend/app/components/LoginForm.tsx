"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; 
import styles from './LoginForm.module.css';
import { FaEnvelope, FaLock, FaKey } from 'react-icons/fa';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState(''); 
  const [showVerification, setShowVerification] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Mensaje de éxito
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  const router = useRouter(); 
  const searchParams = useSearchParams();

  // Detectar si venimos de un registro exitoso
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('¡Cuenta creada exitosamente! Por favor, inicia sesión.');
    }
  }, [searchParams]);

  // Generar o recuperar ID del dispositivo
  useEffect(() => {
    let storedDeviceId = localStorage.getItem('deviceId');
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      localStorage.setItem('deviceId', storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault();
    setError(null);
    setSuccessMessage(null); 
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceId }), 
      });

      if (response.status === 403 || response.status === 401) {
        setError('Credenciales incorrectas. Verifique su email y contraseña.');
        setIsLoading(false);
        return; 
      }

      if (!response.ok) {
        setError('Ocurrió un error en el servidor. Intente más tarde.');
        setIsLoading(false);
        return;
      }

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
      setError('Error de conexión. Asegúrese de que el backend esté corriendo.');
    } finally {
      if (window.location.pathname === '/') setIsLoading(false); 
    }
  };

  const handleVerifySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email, 
            code: verificationCode, 
            deviceId, 
            rememberDevice: true 
        }),
      });

      if (!response.ok) {
         setError('Código incorrecto o expirado. Intente nuevamente.');
         setIsLoading(false);
         return;
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      console.log('Verificación exitosa.');
      router.push('/dashboard');

    } catch (e) {
      console.error(e);
      setError('Error al verificar el código.');
    } finally {
      setIsLoading(false);
    }
  };

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

  // PANTALLA 1: Login Normal
  return (
    <form className={styles.loginForm} onSubmit={handleLoginSubmit}>
      
      {/* Mensaje de éxito al registrarse */}
      {successMessage && (
        <div className={styles.formSuccess}>
          {successMessage}
        </div>
      )}

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

         <p style={{fontSize: '0.9rem', color: '#64748b', marginTop: '10px'}}>
            ¿No tienes cuenta? <a href="/register" style={{color: '#4f46e5', fontWeight: 'bold'}}>Regístrate</a>
        </p>
      </div>
    </form>
  );
}

export default LoginForm;