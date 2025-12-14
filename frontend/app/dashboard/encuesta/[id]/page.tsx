"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './responder.module.css';
import { FaArrowLeft, FaPaperPlane, FaUserInjured } from 'react-icons/fa';
import Swal from 'sweetalert2';

// --- INTERFACES ---
interface Paciente {
    idPaciente: number;
    nombre: string;
    apellidos: string;
    rut?: string;
}

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
    const idEncuesta = params?.id ? String(params.id) : null;

    // --- ESTADOS ---
    const [encuesta, setEncuesta] = useState<Encuesta | null>(null);
    const [pacientes, setPacientes] = useState<Paciente[]>([]); // Lista de pacientes
    const [selectedPaciente, setSelectedPaciente] = useState<string>(""); // ID del paciente seleccionado
    
    const [loading, setLoading] = useState(true);
    const [respuestas, setRespuestas] = useState<{[key: number]: string}>({});
    const [step, setStep] = useState<'intro' | 'form'>('intro');

    useEffect(() => {
        if (idEncuesta) {
            fetchEncuesta();
            fetchPacientes();
        }
    }, [idEncuesta]);

    // 1. Cargar Encuesta
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
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    // 2. Cargar Pacientes para el selector
    const fetchPacientes = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            // Ajusta la URL según tu endpoint real de pacientes
            const res = await fetch('http://localhost:8080/api/v1/pacientes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPacientes(data);
            }
        } catch (error) { console.error("Error cargando pacientes", error); }
    };

    // --- MANEJO DE RESPUESTAS ---

    const handleInputChange = (idPregunta: number, value: string) => {
        setRespuestas(prev => ({ ...prev, [idPregunta]: value }));
    };

    // LÓGICA ESPECIAL: Desmarcar Radio Button
    const handleRadioClick = (idPregunta: number, opcionSeleccionada: string) => {
        // Si la respuesta actual YA ES la opción que acabo de clickear...
        if (respuestas[idPregunta] === opcionSeleccionada) {
            // ...entonces la borramos (desmarcar)
            const nuevasRespuestas = { ...respuestas };
            delete nuevasRespuestas[idPregunta];
            setRespuestas(nuevasRespuestas);
        } else {
            // Si es diferente, la seleccionamos normal
            handleInputChange(idPregunta, opcionSeleccionada);
        }
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

    // --- COMENZAR ENCUESTA ---
    const handleStart = () => {
        if (!selectedPaciente) {
            Swal.fire('Atención', 'Debes seleccionar un paciente para comenzar.', 'warning');
            return;
        }
        setStep('form');
    };

    // --- ENVIAR ---
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
        
        // Payload con Paciente y Respuestas
        const payload = {
            idEncuesta: idEncuesta,
            idPaciente: parseInt(selectedPaciente), // <-- AÑADIDO: Paciente seleccionado
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
                await Swal.fire('¡Registrado!', 'La encuesta se ha guardado correctamente.', 'success');
                router.push('/dashboard/encuesta');
            } else {
                Swal.fire('Error', 'No se pudieron guardar las respuestas. Verifica que el paciente exista.', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Fallo de conexión.', 'error');
        }
    };

    if (loading) return <div className={styles.loading}>Cargando formulario...</div>;
    if (!encuesta) return <div className={styles.error}>Encuesta no encontrada.</div>;

    // --- VISTA 1: INTRODUCCIÓN Y SELECCIÓN DE PACIENTE ---
    if (step === 'intro') {
        return (
            <div className={styles.container}>
                <div className={styles.introCard}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        <FaArrowLeft /> Volver
                    </button>
                    
                    <div className={styles.iconBig}>📝</div>
                    <h1 className={styles.title}>{encuesta.titulo}</h1>
                    
                    <div style={{display: 'inline-block', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1.5rem'}}>
                        Versión {encuesta.version || '1.0'}
                    </div>

                    <p className={styles.desc}>Por favor selecciona el paciente asociado a este registro clínico.</p>

                    {/* SELECTOR DE PACIENTE */}
                    <div className={styles.formGroup} style={{marginBottom: '2rem', textAlign: 'left'}}>
                        <label className={styles.questionLabel} style={{display:'flex', alignItems:'center', gap:'8px'}}>
                            <FaUserInjured /> Seleccionar Paciente:
                        </label>
                        <select 
                            className={styles.select} 
                            style={{width: '100%', padding: '12px', fontSize: '1rem'}}
                            value={selectedPaciente}
                            onChange={(e) => setSelectedPaciente(e.target.value)}
                        >
                            <option value="">-- Buscar Paciente --</option>
                            {pacientes.map(p => (
                                <option key={p.idPaciente} value={p.idPaciente}>
                                    {p.nombre} {p.apellidos} {p.rut ? `(${p.rut})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.metaInfo} style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                        <span>Preguntas a responder: <strong>{encuesta.preguntas?.length || 0}</strong></span>
                    </div>

                    <button className={styles.startBtn} onClick={handleStart}>
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
                    <div>
                        <h2 style={{color: 'var(--text-main)'}}>{encuesta.titulo}</h2>
                        {/* Mostramos qué paciente se está atendiendo */}
                        <small style={{color: 'var(--primary)', fontWeight: '600'}}>
                            Paciente: {pacientes.find(p => p.idPaciente.toString() === selectedPaciente)?.nombre} {pacientes.find(p => p.idPaciente.toString() === selectedPaciente)?.apellidos}
                        </small>
                    </div>
                    <span className={styles.badge}>En progreso</span>
                </div>

                <form onSubmit={handleSubmit}>
                    {encuesta.preguntas.map((p) => (
                        <div key={p.idPregunta} className={styles.questionBlock}>
                            <label className={styles.questionLabel}>
                                {p.textoPregunta}
                                {p.obligatoria && <span className={styles.required}>*</span>}
                            </label>

                            {/* TEXTO */}
                            {(p.tipoPregunta === 'TEXTO' || p.tipoPregunta === 'TEXTO_LIBRE') && (
                                p.tipoPregunta === 'TEXTO' ? 
                                <input type="text" className={styles.input} value={respuestas[p.idPregunta] || ''} onChange={e => handleInputChange(p.idPregunta, e.target.value)} placeholder="Respuesta..." />
                                :
                                <textarea className={styles.textarea} value={respuestas[p.idPregunta] || ''} onChange={e => handleInputChange(p.idPregunta, e.target.value)} placeholder="Escriba aquí..." />
                            )}

                            {/* NUMERO / FECHA */}
                            {p.tipoPregunta === 'NUMERO' && <input type="number" className={styles.input} value={respuestas[p.idPregunta] || ''} onChange={e => handleInputChange(p.idPregunta, e.target.value)} placeholder="0" />}
                            {p.tipoPregunta === 'FECHA' && <input type="date" className={styles.input} value={respuestas[p.idPregunta] || ''} onChange={e => handleInputChange(p.idPregunta, e.target.value)} />}

                            {/* SELECCION UNICA (RADIO CON DESMARCADO) */}
                            {(p.tipoPregunta === 'SELECCION_UNICA' || p.tipoPregunta === 'SELECCION') && (
                                <div className={styles.optionsContainer}>
                                    {p.opciones?.map((op, idx) => (
                                        <label key={idx} className={styles.optionLabel} style={{cursor: 'pointer'}}>
                                            <input 
                                                type="radio"
                                                name={`pregunta_${p.idPregunta}`} 
                                                // Usamos checked para control visual
                                                checked={respuestas[p.idPregunta] === op.textoOpcion}
                                                // Usamos onClick para la lógica de desmarcar
                                                onClick={() => handleRadioClick(p.idPregunta, op.textoOpcion)}
                                                // onChange vacío para evitar warnings de React (la lógica está en onClick)
                                                onChange={() => {}} 
                                            />
                                            {op.textoOpcion}
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* SELECCION MULTIPLE */}
                            {p.tipoPregunta === 'SELECCION_MULTIPLE' && (
                                <div className={styles.optionsContainer}>
                                    {p.opciones?.map((op, idx) => {
                                        const isChecked = (respuestas[p.idPregunta] || '').split(',').includes(op.textoOpcion);
                                        return (
                                            <label key={idx} className={styles.optionLabel}>
                                                <input type="checkbox" checked={isChecked} onChange={(e) => handleCheckboxChange(p.idPregunta, op.textoOpcion, e.target.checked)} />
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
                            <FaPaperPlane style={{marginRight:'5px'}}/> Guardar Registro
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}