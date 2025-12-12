// Ubicación: frontend/app/components/PacienteForm.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import styles from './PacienteForm.module.css';


const formatRut = (value: string) => {

  let cleanValue = value.replace(/[^0-9kK]/g, "").toUpperCase();


  if (cleanValue.length > 9) {
    cleanValue = cleanValue.slice(0, 9);
  }


  if (cleanValue.length < 2) return cleanValue;


  const body = cleanValue.slice(0, -1);
  const dv = cleanValue.slice(-1);


  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");


  return `${formattedBody}-${dv}`;
};

export default function PacienteForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    apellidos: '',
    sexo: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    direccion: '',
    grupo: 'CASO',
    fechaInclusion: new Date().toISOString().split('T')[0],
    peso: '',
    estatura: ''
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;


    if (name === 'rut') {
      const formatted = formatRut(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }


    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // setError(null);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/');
      return;
    }


    const payload = {
      ...formData,

      peso: parseFloat(formData.peso),
      estatura: parseFloat(formData.estatura)
    };

    try {
      const response = await fetch('http://localhost:8080/api/v1/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: '¡Paciente Registrado!',
          text: 'El paciente ha sido registrado exitosamente en el sistema.',
          confirmButtonColor: '#3085d6',
        });
        router.push('/dashboard');
      } else {
        const errData = await response.text();
        const errorMsg = `Error al guardar: ${errData || response.statusText}`;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
          confirmButtonColor: '#d33',
        });
        // setError(errorMsg);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'No se pudo conectar con el servidor.',
        confirmButtonColor: '#d33',
      });
      // setError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.formGrid}>

        <h3 className={styles.sectionTitle}>Identificación del Paciente</h3>

        <div className={styles.formGroup}>
          <label className={styles.label}>RUT *</label>
          <input
            className={styles.input}
            name="rut"
            value={formData.rut}
            onChange={handleChange}
            required
            placeholder="12.345.678-9"
            maxLength={12}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Grupo de Estudio *</label>
          <select className={styles.select} name="grupo" value={formData.grupo} onChange={handleChange} required>
            <option value="CASO">Caso (Paciente)</option>
            <option value="CONTROL">Control</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Nombres *</label>
          <input className={styles.input} name="nombre" value={formData.nombre} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Apellidos *</label>
          <input className={styles.input} name="apellidos" value={formData.apellidos} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Fecha de Nacimiento *</label>
          <input type="date" className={styles.input} name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Sexo *</label>
          <select className={styles.select} name="sexo" value={formData.sexo} onChange={handleChange} required>
            <option value="">Seleccione...</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>

        <h3 className={styles.sectionTitle}>Datos de Contacto</h3>

        <div className={styles.formGroup}>
          <label className={styles.label}>Teléfono</label>
          <input className={styles.input} name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+56 9..." />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input type="email" className={styles.input} name="email" value={formData.email} onChange={handleChange} />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Dirección</label>
          <input className={styles.input} name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Calle, Número, Comuna" />
        </div>

        <h3 className={styles.sectionTitle}>Datos Clínicos Iniciales</h3>

        <div className={styles.formGroup}>
          <label className={styles.label}>Fecha de Inclusión *</label>
          <input type="date" className={styles.input} name="fechaInclusion" value={formData.fechaInclusion} onChange={handleChange} required />
        </div>

        <div className={styles.formGroup}></div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Peso (kg) *</label>
          <input type="number" step="0.1" className={styles.input} name="peso" value={formData.peso} onChange={handleChange} required placeholder="Ej: 70.5" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Estatura (mts) *</label>
          <input type="number" step="0.01" className={styles.input} name="estatura" value={formData.estatura} onChange={handleChange} required placeholder="Ej: 1.75" />
        </div>

        {/* {error && <div className={styles.errorMsg}>{error}</div>} */}

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Registrar Paciente'}
        </button>

      </div>
    </form>
  );
}