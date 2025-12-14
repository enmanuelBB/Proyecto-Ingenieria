"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './encuesta.module.css';
import { FaPlus, FaEdit, FaPlay, FaClipboardCheck } from 'react-icons/fa'; // Corregido import
import Swal from 'sweetalert2';

// 1. ACTUALIZAMOS LA INTERFAZ
interface Encuesta {
    idEncuesta: number;
    titulo: string;
    version?: string;     
}

export default function EncuestasMenuPage() {
    const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchEncuestas();
    }, []);

    const fetchEncuestas = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const res = await fetch('http://localhost:8080/api/v1/encuestas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                
                data.sort((a: Encuesta, b: Encuesta) => b.idEncuesta - a.idEncuesta);
                setEncuestas(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSurvey = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            Swal.fire('Error', 'No estás autenticado.', 'error');
            return;
        }

        let userId = null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
            userId = payload.id || payload.userId || payload.sub; 
        } catch (e) { console.error(e); }

        const { value: formValues } = await Swal.fire({
            title: 'Nueva Encuesta',
            html:
                '<input id="swal-title" class="swal2-input" placeholder="Título de la encuesta">' +
                '<input id="swal-version" class="swal2-input" placeholder="Versión (ej: 1.0)" value="1.0">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Crear',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const titulo = (document.getElementById('swal-title') as HTMLInputElement).value;
                const version = (document.getElementById('swal-version') as HTMLInputElement).value;
                
                if (!titulo) {
                    Swal.showValidationMessage('El título es obligatorio');
                    return false;
                }
                return [titulo, version];
            }
        });

        if (formValues) {
            const [titulo, version] = formValues;
            Swal.showLoading();

            try {
                const payload: any = { titulo, version };
                if (userId) payload.usuarioId = userId; 

                const res = await fetch('http://localhost:8080/api/v1/encuestas', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const data = await res.json();
                    Swal.close();
                    router.push(`/dashboard/constructor/${data.idEncuesta}`);
                } else {
                    const errorText = await res.text();
                    console.error("Error Backend:", errorText);
                    Swal.fire('Error', `El servidor respondió: ${res.status}`, 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Fallo de conexión', 'error');
            }
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.title}>
                    <h1>Encuestas Disponibles</h1>
                    <p>Selecciona una encuesta para responder o editar su estructura.</p>
                </div>
                <button className={styles.createBtn} onClick={handleCreateSurvey}>
                    <FaPlus /> Nueva Encuesta
                </button>
            </header>

            {loading ? (
                <div className={styles.loading}>Cargando encuestas...</div>
            ) : encuestas.length === 0 ? (
                <div className={styles.loading}>
                    <p>No hay encuestas creadas aún.</p>
                    <button className={styles.createBtn} onClick={handleCreateSurvey} style={{margin: '1rem auto'}}>
                        Crear la primera
                    </button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {encuestas.map((encuesta) => (
                        <div key={encuesta.idEncuesta} className={styles.card}>
                            <div className={styles.cardContent}>
                                <div className={styles.iconContainer}>
                                    <FaClipboardCheck />
                                </div>
                                <h3 className={styles.cardTitle}>{encuesta.titulo}</h3>
                                
                                {/* 2. CAMBIAMOS LA DESCRIPCIÓN POR LA VERSIÓN */}
                                <p className={styles.cardDesc} style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                    <span style={{fontWeight:'600', color:'var(--text-main)'}}>Versión:</span> 
                                    <span style={{backgroundColor:'var(--bg-input)', padding:'2px 8px', borderRadius:'12px', fontSize:'0.85rem'}}>
                                        {encuesta.version || "1.0"}
                                    </span>
                                </p>

                            </div>
                            
                            <div className={styles.cardActions}>
                                {/* BOTÓN: EDITAR (Va al Constructor) */}
                                <Link 
                                    href={`/dashboard/constructor/${encuesta.idEncuesta}`} 
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                >
                                    <FaEdit /> Personalizar
                                </Link>

                                {/* BOTÓN: RESPONDER (Va al Formulario) */}
                                <Link 
                                    href={`/dashboard/encuesta/${encuesta.idEncuesta}`} 
                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                >
                                    <FaPlay size={12} /> Responder
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}