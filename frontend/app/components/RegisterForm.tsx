"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import styles from './PacienteForm.module.css'; // Reusing existing styles for consistency
import { API_URL } from '../config';

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // error state is no longer needed for rendering, Swal handles it
  // const [error, setError] = useState<string | null>(null);

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

    // Manual Validation
    if (!formData.name || !formData.lastname || !formData.email || !formData.password || !formData.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'Por favor, completa todos los campos obligatorios.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    setIsLoading(true);
    // setError(null);

    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden.',
        confirmButtonColor: '#3085d6',
      });
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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: '¡Cuenta creada!',
          text: 'Tu cuenta ha sido creada exitosamente. Por favor inicia sesión.',
          confirmButtonColor: '#3085d6',
        });
        router.push('/'); // Redirect to Login
      } else {
        // Try to parse error message
        let errorMsg = 'Error al registrar';
        try {
          const errorData = await response.json();
          errorMsg = `Error al registrar: ${errorData.message || 'Datos inválidos'}`;
        } catch {
          const errorText = await response.text();
          errorMsg = `Error al registrar: ${errorText || response.statusText}`;
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
          confirmButtonColor: '#d33',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'No se pudo conectar con el servidor.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit} noValidate style={{ maxWidth: '450px', margin: '0 auto' }}>
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