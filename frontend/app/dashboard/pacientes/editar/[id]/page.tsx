
"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from '../../../dashboard.module.css';
import PacienteForm from '@/app/components/PacienteForm';
import { FaArrowLeft } from 'react-icons/fa';

export default function EditarPacientePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    return (
        <div className={styles.dashboardContainer}>
            <main style={{ flex: 1, padding: '2rem' }}>
                <button
                    onClick={() => router.back()}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', marginBottom: '1rem' }}
                >
                    <FaArrowLeft /> Volver
                </button>

                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', color: '#1e293b', fontWeight: 'bold' }}>Editar Paciente</h1>
                    <p style={{ color: '#64748b' }}>Modifica los datos del paciente seleccionado.</p>
                </header>

                <PacienteForm idPaciente={Number(id)} />
            </main>
        </div>
    );
}
