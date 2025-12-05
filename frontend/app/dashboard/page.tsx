"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import Sidebar from '../components/Sidebar';
import { FaUserPlus, FaSearch } from 'react-icons/fa';

interface Paciente {
    idPaciente: number;
    rut: string;
    nombre: string;
    apellidos: string;
    sexo: string;
    fechaNacimiento: string;
}

export default function PacientesPage() {
    const router = useRouter();
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/');
            return;
        }

        const fetchPacientes = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/v1/pacientes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setPacientes(data);
                }
            } catch (error) {
                console.error("Error cargando pacientes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPacientes();
    }, [router]);

    const filteredPacientes = pacientes.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.rut.includes(searchTerm)
    );

    return (
        <div className={styles.dashboardContainer}>

            <Sidebar />

            <main className={styles.mainContent}>

                <header className={styles.header}>
                    <div className={styles.welcomeText}>
                        <h1>Gestión de Pacientes</h1>
                        <p>Consulta y administra la base de datos de participantes.</p>
                    </div>

                    {/* BOTÓN ACTIVADO */}
                    <button
                        className={styles.actionButton}
                        style={{width: 'auto', backgroundColor: '#4f46e5', color: 'white'}}
                        onClick={() => router.push('/dashboard/pacientes/nuevo')}
                    >
                        <FaUserPlus /> Nuevo Paciente
                    </button>

                </header>

                {/* Barra de Búsqueda */}
                <div style={{marginBottom: '2rem', display: 'flex', gap: '1rem'}}>
                    <div style={{position: 'relative', width: '100%', maxWidth: '400px'}}>
                        <FaSearch style={{position: 'absolute', left: '15px', top: '12px', color: '#94a3b8'}}/>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o RUT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.7rem 1rem 0.7rem 2.5rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>
                </div>

                <div className={styles.card}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>RUT</th>
                            <th>Nombre Completo</th>
                            <th>Sexo</th>
                            <th>F. Nacimiento</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{textAlign:'center', padding:'2rem'}}>Cargando pacientes...</td></tr>
                        ) : filteredPacientes.length > 0 ? (
                            filteredPacientes.map((p) => (
                                <tr key={p.idPaciente}>
                                    <td>{p.idPaciente}</td>
                                    <td>{p.rut}</td>
                                    <td style={{fontWeight: '500'}}>{p.nombre} {p.apellidos}</td>
                                    <td>{p.sexo}</td>
                                    <td>{new Date(p.fechaNacimiento).toLocaleDateString()}</td>
                                    <td>
                                        <button style={{color: '#4f46e5', background: 'none', border: 'none', cursor:'pointer', marginRight: '10px'}}>Editar</button>
                                        <button style={{color: '#ef4444', background: 'none', border: 'none', cursor:'pointer'}}>Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>No se encontraron pacientes.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>

            </main>
        </div>
    );
}