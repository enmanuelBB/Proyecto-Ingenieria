
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaClipboardList, FaUserCheck, FaCheckCircle, FaArrowLeft, FaEye, FaRegCalendarAlt, FaUser } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import styles from './encuesta.module.css';

interface Encuesta {
    idEncuesta: number;
    titulo: string;
    descripcion?: string;
    version?: string;
}

interface RegistroCompleto {
    idRegistro: number;
    fechaRealizacion: string;
    paciente: {
        idPaciente: number;
        nombre: string;
        rut: string;
    };
    usuario: {
        username: string;
    };
}

export default function EncuestaIntermediatePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [encuesta, setEncuesta] = useState<Encuesta | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [hasResponded, setHasResponded] = useState<boolean>(false);
    const [registros, setRegistros] = useState<RegistroCompleto[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const storedRole = localStorage.getItem('userRole'); 

        if (!token) {
            router.push('/');
            return;
        }
        setRole(storedRole || 'USER'); 

        const fetchData = async () => {
            try {
                // 1. Cargar Detalles de Encuesta
                const surveyRes = await fetch(`http://localhost:8080/api/v1/encuestas/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!surveyRes.ok) throw new Error('Error al cargar la encuesta');
                const surveyData = await surveyRes.json();
                setEncuesta(surveyData);

                // 3. Si es ADMIN, cargar todas las respuestas
                if (storedRole === 'ADMIN') {
                    const regRes = await fetch(`http://localhost:8080/api/v1/encuestas/${id}/registros`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (regRes.ok) {
                        const regData = await regRes.json();
                        setRegistros(regData);
                    }
                }

            } catch (err: any) {
                setError(err.message || 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, router]);

    const handleResponder = () => {
        router.push(`/responder-encuesta/${id}`);
    };

    if (loading) return <div className={styles.loading}>Cargando información...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;
    if (!encuesta) return <div className={styles.error}>No se encontró la encuesta.</div>;

    const isAdmin = role === 'ADMIN';

    return (
        <div className={styles.container}>
            
            {/* 1. SIDEBAR INTEGRADO */}
            <Sidebar />

            <main className={styles.mainContent}>
                
                {/* Header Superior */}
                <header className={styles.header}>
                    <div>
                        <button 
                            onClick={() => router.back()} 
                            style={{background:'none', border:'none', color:'#64748b', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', marginBottom:'10px', fontSize:'0.9rem'}}
                        >
                            <FaArrowLeft /> Volver
                        </button>
                        <div className={styles.titleSection}>
                            <h1>
                                {encuesta.titulo} 
                                {encuesta.version && <span className={styles.badge}>v{encuesta.version}</span>}
                            </h1>
                            <p className={styles.subtitle}>Gestión y seguimiento de respuestas</p>
                        </div>
                    </div>
                    
                    {/* --- BOTÓN SUPERIOR ELIMINADO --- */}
                    
                </header>

                {/* VISTA DE ADMINISTRADOR */}
                {isAdmin ? (
                    <>
                        {/* Estadísticas Rápidas */}
                        <section className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.iconBox}>
                                    <FaUserCheck />
                                </div>
                                <div className={styles.statContent}>
                                    <h3>Total Respuestas</h3>
                                    <p>{registros.length}</p>
                                </div>
                            </div>
                            
                            {/* Botón Acción Admin (Opcional: Si quieres que el admin también pueda responder desde aquí) */}
                             <div className={styles.statCard} style={{cursor: 'pointer'}} onClick={handleResponder}>
                                <div className={styles.iconBox} style={{backgroundColor: '#e0e7ff', color: '#4f46e5'}}>
                                    <FaClipboardList />
                                </div>
                                <div className={styles.statContent}>
                                    <h3>Acción Rápida</h3>
                                    <p style={{fontSize: '1rem', color: '#4f46e5'}}>Responder Encuesta</p>
                                </div>
                            </div>

                        </section>

                        {/* Tabla de Registros */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}><FaClipboardList color="#4f46e5"/> Registro de Respuestas</h3>
                            </div>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Paciente</th>
                                        <th>Fecha</th>
                                        <th>Usuario</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registros.length > 0 ? registros.map((reg) => (
                                        <tr key={reg.idRegistro}>
                                            <td style={{color:'#64748b'}}>#{reg.idRegistro}</td>
                                            <td style={{fontWeight:'600', color:'#1e293b'}}>{reg.paciente?.nombre || 'N/A'}</td>
                                            <td>
                                                <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                                    <FaRegCalendarAlt color="#94a3b8"/>
                                                    {new Date(reg.fechaRealizacion).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                                    <FaUser color="#94a3b8" size={12}/>
                                                    {reg.usuario?.username}
                                                </div>
                                            </td>
                                            <td>
                                                <button className={styles.btnSecondary} style={{padding:'0.4rem 0.8rem', fontSize:'0.85rem'}}>
                                                    <FaEye /> Ver
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} style={{textAlign:'center', padding:'3rem', color:'#64748b'}}>
                                                No hay respuestas registradas aún.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    /* VISTA DE USUARIO NORMAL (ESTADO) */
                    <div className={styles.card}>
                        <div className={styles.userState}>
                            {hasResponded ? (
                                <>
                                    <div className={`${styles.stateIcon} ${styles.successIcon}`}>
                                        <FaCheckCircle />
                                    </div>
                                    <div className={styles.stateText}>
                                        <h2>¡Encuesta Completada!</h2>
                                        <p>Ya has registrado una respuesta para este formulario.</p>
                                    </div>
                                    <button className={`${styles.btn} ${styles.btnSecondary}`} disabled>
                                        Completado
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className={styles.stateIcon}>
                                        <FaClipboardList />
                                    </div>
                                    <div className={styles.stateText}>
                                        <h2>Disponible para Responder</h2>
                                        <p>Selecciona un paciente y comienza a llenar el formulario clínico.</p>
                                    </div>
                                    
                                    {/* --- BOTÓN CENTRAL (ÚNICO) --- */}
                                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleResponder}>
                                        Comenzar Ahora
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}