"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../dashboard.module.css'; 
import PacienteForm from '@/app/components/PacienteForm'; 
import { FaArrowLeft } from 'react-icons/fa';

export default function NuevoPacientePage() {
  const router = useRouter();

  return (
    <div className={styles.dashboardContainer}>
      <main style={{flex: 1, padding: '2rem'}}>
        <button 
            onClick={() => router.back()} 
            // CAMBIO: color '#64748b' -> 'var(--text-muted)'
            style={{display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginBottom: '1rem'}}
        >
            <FaArrowLeft /> Volver
        </button>

        <header style={{marginBottom: '2rem'}}>
            {/* CAMBIO PRINCIPAL: color '#1e293b' -> 'var(--text-main)' */}
            <h1 style={{fontSize: '2rem', color: 'var(--text-main)', fontWeight: 'bold'}}>
                Nuevo Registro
            </h1>
            {/* CAMBIO: color '#64748b' -> 'var(--text-muted)' */}
            <p style={{color: 'var(--text-muted)'}}>
                Ingresa los datos del participante para crear su ficha.
            </p>
        </header>

        <PacienteForm />
      </main>
    </div>
  );
}