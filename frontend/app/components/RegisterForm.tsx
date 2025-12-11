"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PacienteForm.module.css'; // Reusing existing styles for consistency

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }

    const payload = {
      name: formData.name,
      lastname: formData.lastname,
      email: formData.email,
      password: formData.password
    };

    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('¡Cuenta creada exitosamente! Por favor inicia sesión.');
        router.push('/'); // Redirect to Login
      } else {
        // Try to parse error message
        try {
          const errorData = await response.json();
          // Assuming backend returns standard Spring Boot error structure or custom token response with error
          // Adjust based on your AuthController error handling
          setError(`Error al registrar: ${errorData.message || 'Datos inválidos'}`);
        } catch {
          const errorText = await response.text();
          setError(`Error al registrar: ${errorText || response.statusText}`);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit} style={{ maxWidth: '450px', margin: '0 auto' }}>
      <div className={styles.formGrid} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <h3 className={styles.sectionTitle} style={{ textAlign: 'center' }}>Registrar Usuario</h3>

        <div className={styles.formGroup}>
          <label className={styles.label}>Nombres *</label>
          <input
            className={styles.input}
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Ej: Juan"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Apellidos *</label>
          <input
            className={styles.input}
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
            placeholder="Ej: Pérez"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Correo Electrónico *</label>
          <input
            type="email"
            className={styles.input}
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="juan.perez@ejemplo.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Contraseña *</label>
          <input
            type="password"
            className={styles.input}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="******"
            minLength={6}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Confirmar Contraseña *</label>
          <input
            type="password"
            className={styles.input}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="******"
          />
        </div>

        {error && <div className={styles.errorMsg} style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</div>}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
          style={{ marginTop: '20px' }}
        >
          {isLoading ? 'Registrando...' : 'Crear Cuenta'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>¿Ya tienes cuenta? </span>
          <span
            onClick={() => router.push('/')}
            style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Inicia Sesión
          </span>
        </div>

      </div>
    </form>
  );
}