// Ubicación: frontend/app/components/PacienteForm.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import styles from './PacienteForm.module.css';
import { API_URL } from '../config';


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

const validateRut = (rut: string): boolean => {
  if (!rut) return false;
  const cleanRut = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (cleanRut.length < 2) return false;

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);

  let suma = 0;
  let multiplo = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    suma += parseInt(body.charAt(i)) * multiplo;
    if (multiplo < 7) multiplo += 1;
    else multiplo = 2;
  }

  const dvEsperado = 11 - (suma % 11);
  let dvCalculado = "";

  if (dvEsperado === 11) dvCalculado = "0";
  else if (dvEsperado === 10) dvCalculado = "K";
  else dvCalculado = dvEsperado.toString();

  return dv === dvCalculado;
};

interface PacienteFormProps {
  idPaciente?: number;
}

export default function PacienteForm({ idPaciente }: PacienteFormProps) {
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
    // ... rest of handler
    if (name === 'rut') {
      const formatted = formatRut(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Cargar datos si se está editando
  React.useEffect(() => {
    const fetchData = async () => {
      if (idPaciente) {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setIsLoading(true);
        try {
          const res = await fetch(`${API_URL}/api/v1/pacientes/${idPaciente}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            const data = await res.json();
            // Need to set form data here based on response structure
            setFormData({
              rut: data.rut || '',
              nombre: data.nombre || '',
              apellidos: data.apellidos || '',
              sexo: data.sexo || '',
              fechaNacimiento: data.fechaNacimiento || '',
              telefono: data.telefono || '',
              email: data.email || '',
              direccion: data.direccion || '',
              grupo: data.grupo || 'CASO',
              fechaInclusion: data.fechaInclusion || new Date().toISOString().split('T')[0],
              peso: data.peso || '',
              estatura: data.estatura || ''
            });
          }
        } catch (error) {
          console.error("Error fetching patient:", error);
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el paciente' });
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [idPaciente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    const payload = {
      rut: formData.rut,
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      sexo: formData.sexo,
      fechaNacimiento: formData.fechaNacimiento,
      email: formData.email,
      telefono: formData.telefono,
      direccion: formData.direccion,
      grupo: formData.grupo,
      fechaInclusion: formData.fechaInclusion,
      peso: parseFloat(formData.peso),
      estatura: parseFloat(formData.estatura)
    };

    try {
      const url = idPaciente
        ? `${API_URL}/api/v1/pacientes/${idPaciente}`
        : `${API_URL}/api/v1/pacientes`;

      const method = idPaciente ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: idPaciente ? '¡Paciente Actualizado!' : '¡Paciente Registrado!',
          text: idPaciente
            ? 'Los datos han sido guardados correctamente.'
            : 'El paciente ha sido registrado exitosamente en el sistema.',
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
    <form className={styles.formContainer} onSubmit={handleSubmit} noValidate>
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
          {isLoading ? 'Guardando...' : (idPaciente ? 'Guardar Cambios' : 'Registrar Paciente')}
        </button>

      </div>
    </form>
  );
}