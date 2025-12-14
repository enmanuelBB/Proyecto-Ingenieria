"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import styles from './register.module.css'; 

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

    if (!formData.name || !formData.lastname || !formData.email || !formData.password || !formData.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'Por favor, completa todos los campos obligatorios.',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden.',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          lastname: formData.lastname,
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: '¡Cuenta creada!',
          text: 'Tu cuenta ha sido creada exitosamente. Por favor inicia sesión.',
          confirmButtonColor: '#3b82f6',
        });
        router.push('/');
      } else {
        const errorText = await response.text();
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: errorText || 'Datos inválidos',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'No se pudo conectar con el servidor.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
            <div className={styles.logoWrapper}>
                <Image
                    src="/logo-vital2.png" // Asegúrate de que esta ruta sea correcta
                    alt="Logo Ingeniería Vital"
                    width={50} 
                    height={50}
                    className={styles.logo}
                />
            </div>
            <h2 className={styles.title}>Crear Nueva Cuenta</h2>
            <p className={styles.subtitle}>Únete a la plataforma para comenzar</p>
        </div>
          
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Nombres</label>
                    <input
                        className={styles.input}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej: Juan"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Apellidos</label>
                    <input
                        className={styles.input}
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        placeholder="Ej: Pérez"
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Correo Electrónico</label>
                <input
                    type="email"
                    className={styles.input}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="juan.perez@ejemplo.com"
                />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Contraseña</label>
                <input
                    type="password"
                    className={styles.input}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="******"
                    minLength={6}
                />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Confirmar Contraseña</label>
                <input
                    type="password"
                    className={styles.input}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="******"
                />
            </div>

            <button
                type="submit"
                className={styles.button}
                disabled={isLoading}
            >
                {isLoading ? 'Registrando...' : 'Crear Cuenta'}
            </button>

            <div className={styles.footer}>
                <span className={styles.footerText}>¿Ya tienes cuenta? </span>
                <Link href="/" className={styles.link}>
                    Inicia Sesión
                </Link>
            </div>
        </form>
      </div>
    </div>
  );
}