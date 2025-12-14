"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './encuesta.module.css';
import { FaPlus, FaClipboardList, FaEdit, FaPlay, FaClipboardCheck } from 'react-icons/fa';
import Swal from 'sweetalert2';

interface Encuesta {
    idEncuesta: number;
    titulo: string;
    descripcion: string;
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
                setEncuestas(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Función para crear una nueva encuesta rápida
    const handleCreateSurvey = async () => {
        const token = localStorage.getItem('accessToken');
        
        // 1. Verificación visual si falta el token
        if (!token) {
            Swal.fire('Error', 'No estás autenticado. Por favor inicia sesión nuevamente.', 'error');
            return;
        }

        const { value: formValues } = await Swal.fire({
            title: 'Nueva Encuesta',
            html:
                '<input id="swal-title" class="swal2-input" placeholder="Título de la encuesta">' +
                '<textarea id="swal-desc" class="swal2-textarea" placeholder="Descripción breve" style="margin-top: 10px;"></textarea>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Crear y Personalizar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: 'var(--primary)',
            preConfirm: () => {
                const titulo = (document.getElementById('swal-title') as HTMLInputElement).value;
                const descripcion = (document.getElementById('swal-desc') as HTMLTextAreaElement).value;
                
                if (!titulo) {
                    Swal.showValidationMessage('El título es obligatorio');
                    return false; // Detiene el cierre del modal
                }
                return [titulo, descripcion];
            }
        });

        if (formValues) {
            const [titulo, descripcion] = formValues;
            
            try {
                // Indicador de carga
                Swal.showLoading();

                console.log("Enviando datos:", { titulo, descripcion }); // DEBUG

                const res = await fetch('http://localhost:8080/api/v1/encuestas', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ titulo, descripcion })
                });

                console.log("Status respuesta:", res.status); // DEBUG

                if (res.ok) {
                    const data = await res.json();
                    console.log("Data recibida:", data); // DEBUG

                    if (data && data.idEncuesta) {
                        // Éxito total: Redirigir
                        router.push(`/dashboard/constructor/${data.idEncuesta}`);
                        
                        // Cerramos el loading de Swal
                        Swal.close();
                    } else {
                        
                        Swal.fire('Creada', 'La encuesta se creó, pero no pudimos redirigirte automáticamente.', 'success');
                        fetchEncuestas(); // Recargamos la lista
                    }
                } else {
                    const textError = await res.text();
                    console.error("Error backend:", textError);
                    Swal.fire('Error', `El servidor respondió: ${res.status}`, 'error');
                }
            } catch (error) {
                console.error("Error de red:", error);
                Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
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
                                <p className={styles.cardDesc}>
                                    {encuesta.descripcion || "Sin descripción disponible."}
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