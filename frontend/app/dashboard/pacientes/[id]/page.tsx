"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './patientDetail.module.css';
import { FaArrowLeft, FaFileMedical, FaUser } from 'react-icons/fa';

interface Paciente {
    idPaciente: number;
    rut: string;
    nombre: string;
    apellidos: string;
    sexo: string;
    fechaNacimiento: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    prevision?: string;
}

interface Registro {
    idRespuesta: number;
    idEncuesta: number;
    tituloEncuesta: string;
    fechaRealizacion: string; // ISO String
}

export default function PatientDetailPage() {
    const router = useRouter();
    const params = useParams();
    const idPaciente = params.id;

    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [registros, setRegistros] = useState<Registro[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/');
            return;
        }

        if (!idPaciente) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Obtener datos del paciente
                const resPaciente = await fetch(`http://localhost:8080/api/v1/pacientes/${idPaciente}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!resPaciente.ok) {
                    if (resPaciente.status === 404) throw new Error("Paciente no encontrado");
                    throw new Error("Error obteniendo datos del paciente");
                }
                const dataPaciente: Paciente = await resPaciente.json();
                setPaciente(dataPaciente);

                // 2. Obtener registros (historial de encuestas)
                const resRegistros = await fetch(`http://localhost:8080/api/v1/pacientes/${idPaciente}/registros`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (resRegistros.ok) {
                    // Nota: El endpoint /registros del controller PacienteController devuelve RegistroCompletoResponseDto.
                    // Ajustamos la interfaz localmente o asumimos que devuelve lo necesario.
                    const dataRegistros = await resRegistros.json();
                    // Mapeamos si es necesario, por ahora asumimos compatibilidad basica
                    setRegistros(dataRegistros);
                }

            } catch (err: any) {
                console.error(err);
                setError(err.message || "Error desconocido");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [idPaciente, router]);

    if (loading) return <div style={{ padding: '2rem' }}>Cargando ficha clínica...</div>;
    if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
    if (!paciente) return <div style={{ padding: '2rem' }}>No se encontró el paciente.</div>;

    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>

                <button onClick={() => router.back()} className={styles.backButton}>
                    <FaArrowLeft /> Volver al Dashboard
                </button>

                <header className={styles.header}>
                    <h1 className={styles.title}>{paciente.nombre} {paciente.apellidos}</h1>
                    <p className={styles.subtitle}>Ficha Clínica Digital • ID: {paciente.idPaciente}</p>
                </header>

                <div className={styles.grid}>
                    {/* Tarjeta de Datos Personales */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><FaUser style={{ marginRight: '8px' }} /> Datos Personales</h2>

                        <div className={styles.infoGroup}>
                            <span className={styles.label}>RUT</span>
                            <span className={styles.value}>{paciente.rut}</span>
                        </div>

                        <div className={styles.infoGroup}>
                            <span className={styles.label}>Fecha de Nacimiento</span>
                            <span className={styles.value}>{paciente.fechaNacimiento}</span>
                        </div>

                        <div className={styles.infoGroup}>
                            <span className={styles.label}>Sexo</span>
                            <span className={styles.value}>{paciente.sexo}</span>
                        </div>

                        {/* Campos opcionales si vienen del backend */}
                        {paciente.prevision && (
                            <div className={styles.infoGroup}>
                                <span className={styles.label}>Previsión</span>
                                <span className={styles.value}>{paciente.prevision}</span>
                            </div>
                        )}
                        {paciente.email && (
                            <div className={styles.infoGroup}>
                                <span className={styles.label}>Contacto</span>
                                <span className={styles.value}>{paciente.email}</span>
                            </div>
                        )}
                    </div>

                    {/* Tarjeta de Historial Clínico (Encuestas) */}
                    <div className={styles.card} style={{ height: '100%' }}>
                        <h2 className={styles.cardTitle}><FaFileMedical style={{ marginRight: '8px' }} /> Historial de Encuestas</h2>

                        {registros.length === 0 ? (
                            <p style={{ color: '#64748b' }}>No se han registrado encuestas para este paciente.</p>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Encuesta</th>
                                        <th>Fecha</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registros.map((reg, idx) => (
                                        <tr key={idx}>
                                            <td>{reg.tituloEncuesta || "Sin Título"}</td>
                                            <td>{reg.fechaRealizacion ? new Date(reg.fechaRealizacion).toLocaleDateString() : "-"}</td>
                                            <td>
                                                {/* Aquí podríamos poner un botón para ver el detalle de esa respuesta específica */}
                                                <button style={{ color: '#4f46e5', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                                    Ver Detalles
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
