"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './responder.module.css';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import Swal from 'sweetalert2';

interface Opcion {
    textoOpcion: string;
}

interface Pregunta {
    idPregunta: number;
    textoPregunta: string;
    tipoPregunta: string; 
    obligatoria: boolean;
    opciones: Opcion[];
}

interface Encuesta {
    idEncuesta: number;
    titulo: string;
    version?: string;    
    preguntas: Pregunta[];
}

export default function ResponderEncuestaPage() {
    const params = useParams();
    const router = useRouter();
    // Validación de seguridad para params
    const idEncuesta = params?.id ? String(params.id) : null;

    const [encuesta, setEncuesta] = useState<Encuesta | null>(null);
    const [loading, setLoading] = useState(true);
    const [respuestas, setRespuestas] = useState<{[key: number]: string}>({});
    const [step, setStep] = useState<'intro' | 'form'>('intro');

    useEffect(() => {
        if (idEncuesta) fetchEncuesta();
    }, [idEncuesta]);

    const fetchEncuesta = async () => {
        const token = localStorage.getItem('accessToken');
        if (!idEncuesta) return;
        
        try {
            const res = await fetch(`http://localhost:8080/api/v1/encuestas/${idEncuesta}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if(data.preguntas) {
                    data.preguntas.sort((a: Pregunta, b: Pregunta) => a.idPregunta - b.idPregunta);
                }
                setEncuesta(data);
            } else {
                Swal.fire('Error', 'No se pudo cargar la encuesta', 'error');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (idPregunta: number, value: string) => {
        setRespuestas(prev => ({ ...prev, [idPregunta]: value }));
    };

    const handleCheckboxChange = (idPregunta: number, opcion: string, checked: boolean) => {
        setRespuestas(prev => {
            const actual = prev[idPregunta] ? prev[idPregunta].split(',') : [];
            let nuevoState = [...actual];
            if (checked) {
                if (!nuevoState.includes(opcion)) nuevoState.push(opcion);
            } else {
                nuevoState = nuevoState.filter(item => item !== opcion);
            }
            return { ...prev, [idPregunta]: nuevoState.join(',') };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (encuesta?.preguntas) {
            for (const p of encuesta.preguntas) {
                if (p.obligatoria && (!respuestas[p.idPregunta] || respuestas[p.idPregunta].trim() === '')) {
                    Swal.fire('Faltan datos', `La pregunta "${p.textoPregunta}" es obligatoria.`, 'warning');
                    return;
                }
            }
        }

        const token = localStorage.getItem('accessToken');
        const payload = {
            idEncuesta: idEncuesta,
            respuestas: Object.entries(respuestas).map(([k, v]) => ({
                idPregunta: parseInt(k),
                valorRespuesta: v
            }))
        };

        try {
            const res = await fetch(`http://localhost:8080/api/v1/encuestas/${idEncuesta}/responder`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await Swal.fire('¡Enviado!', 'La encuesta se ha guardado correctamente.', 'success');
                router.push('/dashboard/encuesta');
            } else {
                Swal.fire('Error', 'No se pudieron guardar las respuestas.', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Fallo de conexión.', 'error');
        }
    };

    if (loading) return <div className={styles.loading}>Cargando formulario...</div>;
    if (!encuesta) return <div className={styles.error}>Encuesta no encontrada.</div>;

    // --- VISTA 1: INTRODUCCIÓN ---
    if (step === 'intro') {
        return (
            <div className={styles.container}>
                <div className={styles.introCard}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        <FaArrowLeft /> Volver
                    </button>
                    
                    <div className={styles.iconBig}>📝</div>
                    
                    <h1 className={styles.title}>{encuesta.titulo}</h1>
                    
                    {/* CAMBIO 1: Mostrar Versión */}
                    <div style={{
                        display: 'inline-block',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)', 
                        color: 'var(--primary)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '1.5rem'
                    }}>
                        Versión {encuesta.version || '1.0'}
                    </div>

                    {/* CAMBIO 2: Mejorar espaciado (marginBottom agregado) */}
                    <div className={styles.metaInfo} style={{ marginBottom: '2.5rem', color: 'var(--text-muted)' }}>
                        <span>Esta encuesta contiene <strong>{encuesta.preguntas?.length || 0}</strong> preguntas.</span>
                    </div>

                    <button className={styles.startBtn} onClick={() => setStep('form')}>
                        Comenzar Ahora
                    </button>
                </div>
            </div>
        );
    }

    // --- VISTA 2: FORMULARIO ---
    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <div className={styles.formHeader}>
                    <h2>{encuesta.titulo}</h2>
                    <span className={styles.badge}>En progreso</span>
                </div>

                <form onSubmit={handleSubmit}>
                    {encuesta.preguntas.map((p) => (
                        <div key={p.idPregunta} className={styles.questionBlock}>
                            <label className={styles.questionLabel}>
                                {p.textoPregunta}
                                {p.obligatoria && <span className={styles.required}>*</span>}
                            </label>

                            {/* TEXTO CORTO */}
                            {p.tipoPregunta === 'TEXTO' && (
                                <input 
                                    type="text" 
                                    className={styles.input} 
                                    value={respuestas[p.idPregunta] || ''}
                                    onChange={e => handleInputChange(p.idPregunta, e.target.value)}
                                    placeholder="Respuesta corta..."
                                />
                            )}

                            {/* TEXTO LIBRE (BLOQUE GRANDE) */}
                            {p.tipoPregunta === 'TEXTO_LIBRE' && (
                                <textarea 
                                    className={styles.textarea} 
                                    value={respuestas[p.idPregunta] || ''}
                                    onChange={e => handleInputChange(p.idPregunta, e.target.value)}
                                    placeholder="Escribe tu respuesta aquí..."
                                />
                            )}

                            {/* NUMERO */}
                            {p.tipoPregunta === 'NUMERO' && (
                                <input 
                                    type="number" 
                                    className={styles.input} 
                                    value={respuestas[p.idPregunta] || ''}
                                    onChange={e => handleInputChange(p.idPregunta, e.target.value)}
                                    placeholder="0"
                                />
                            )}

                            {/* FECHA */}
                            {p.tipoPregunta === 'FECHA' && (
                                <input 
                                    type="date" 
                                    className={styles.input} 
                                    value={respuestas[p.idPregunta] || ''}
                                    onChange={e => handleInputChange(p.idPregunta, e.target.value)}
                                />
                            )}

                            {/* SELECCION UNICA (RADIO BUTTONS) */}
                            {(p.tipoPregunta === 'SELECCION_UNICA' || p.tipoPregunta === 'SELECCION') && (
                                <div className={styles.optionsContainer}>
                                    {p.opciones?.map((op, idx) => (
                                        <label key={idx} className={styles.optionLabel}>
                                            <input 
                                                type="radio"
                                                name={`pregunta_${p.idPregunta}`} 
                                                value={op.textoOpcion}
                                                checked={respuestas[p.idPregunta] === op.textoOpcion}
                                                onChange={(e) => handleInputChange(p.idPregunta, e.target.value)}
                                            />
                                            {op.textoOpcion}
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* SELECCION MULTIPLE (CHECKBOXES) */}
                            {p.tipoPregunta === 'SELECCION_MULTIPLE' && (
                                <div className={styles.optionsContainer}>
                                    {p.opciones?.map((op, idx) => {
                                        const isChecked = (respuestas[p.idPregunta] || '').split(',').includes(op.textoOpcion);
                                        return (
                                            <label key={idx} className={styles.optionLabel}>
                                                <input 
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => handleCheckboxChange(p.idPregunta, op.textoOpcion, e.target.checked)}
                                                />
                                                {op.textoOpcion}
                                            </label>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ))}

                    <div className={styles.actions}>
                        <button type="button" onClick={() => setStep('intro')} className={styles.btnSecondary}>Cancelar</button>
                        <button type="submit" className={styles.btnPrimary}>
                            <FaPaperPlane style={{marginRight:'5px'}}/> Enviar Respuestas
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}