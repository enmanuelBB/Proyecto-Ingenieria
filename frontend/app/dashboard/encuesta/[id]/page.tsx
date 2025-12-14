"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './responder.module.css';
import { FaArrowLeft, FaPaperPlane, FaUserInjured, FaHistory } from 'react-icons/fa';
import Swal from 'sweetalert2';

// --- INTERFACES ---
interface Paciente {
    idPaciente: number;
    nombre: string;
    apellidos: string;
    rut?: string;
}

interface Opcion {
    idOpcion: number;
    textoOpcion: string;
    idPreguntaDestino?: number; // Nuevo campo para lógica de salto
}

interface Pregunta {
    idPregunta: number;
    textoPregunta: string;
    tipoPregunta: string;
    obligatoria: boolean;
    oculta?: boolean; // Campo opcional
    opciones: Opcion[];
}

interface Encuesta {
    idEncuesta: number;
    titulo: string;
    version?: string;
    preguntas: Pregunta[];
}

export default function ResponderEncuestaPage() {
    const router = useRouter();
    const params = useParams();


    const idEncuesta = params?.id ? String(params.id) : null;

    const [encuesta, setEncuesta] = useState<Encuesta | null>(null);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [selectedPaciente, setSelectedPaciente] = useState<string>("");

    const [loading, setLoading] = useState(true);
    const [respuestas, setRespuestas] = useState<{ [key: number]: string | number | number[] }>({});
    const [errorIds, setErrorIds] = useState<number[]>([]); // Estado de errores
    const [step, setStep] = useState<'intro' | 'form'>('intro');

    // Cargar datos
    useEffect(() => {
        if (idEncuesta) {
            fetchEncuesta();
            fetchPacientes();
        }
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
                if (data.preguntas) {
                    data.preguntas.sort((a: Pregunta, b: Pregunta) => a.idPregunta - b.idPregunta);
                }
                setEncuesta(data);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const fetchPacientes = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch('http://localhost:8080/api/v1/pacientes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPacientes(data);
            }
        } catch (error) { console.error(error); }
    };

    // --- LÓGICA DE SALTO DE PREGUNTAS (SKIP LOGIC) ---
    const getVisibleQuestions = () => {
        if (!encuesta) return [];

        const visibleQuestions: Pregunta[] = [];
        let jumpTargetId: number | null = null;

        // Ordenar por ID para flujo secuencial
        const sortedQuestions = [...encuesta.preguntas].sort((a, b) => a.idPregunta - b.idPregunta);

        for (const p of sortedQuestions) {

            // 1. MANEJO DE SALTO ACTIVO
            if (jumpTargetId !== null) {
                if (p.idPregunta === jumpTargetId) {
                    jumpTargetId = null; // Aterrizamos
                    visibleQuestions.push(p);
                } else {
                    continue; // Saltamos
                }
            } else {
                // 2. FLUJO NORMAL
                // Si la pregunta es OCULTA por defecto, solo se muestra si el salto nos trajo aquí.
                // Como jumpTargetId es null aquí, significa que llegamos por flujo natural.
                if (p.oculta) {
                    continue;
                }
                visibleQuestions.push(p);
            }

            // 3. VERIFICAR NUEVO SALTO
            // Solo verificamos si la pregunta actual está visible y fue respondida
            if (jumpTargetId === null) {
                const respuesta: string | number | number[] | undefined = respuestas[p.idPregunta];

                // Si hay respuesta y es tipo selección (que maneja lógica de ID)
                if (respuesta !== undefined && respuesta !== null && p.opciones) {
                    // Si es número, buscamos por ID de opción
                    if (typeof respuesta === 'number') {
                        const opcionSeleccionada: Opcion | undefined = p.opciones.find((op: Opcion) => op.idOpcion === respuesta);
                        if (opcionSeleccionada && opcionSeleccionada.idPreguntaDestino) {
                            jumpTargetId = opcionSeleccionada.idPreguntaDestino;
                        }
                    }
                }
            }
        }
        return visibleQuestions;
    };

    const visibleQuestions = getVisibleQuestions();

    // --- HANDLERS ---
    const handleInputChange = (idPregunta: number, value: string) => {
        setRespuestas(prev => ({ ...prev, [idPregunta]: value }));
        if (errorIds.includes(idPregunta)) setErrorIds(prev => prev.filter(id => id !== idPregunta));
    };

    const handleRadioClick = (idPregunta: number, idOpcion: number) => {
        if (respuestas[idPregunta] === idOpcion) {
            const nuevas = { ...respuestas };
            delete nuevas[idPregunta];
            setRespuestas(nuevas);
        } else {
            setRespuestas(prev => ({ ...prev, [idPregunta]: idOpcion }));
        }
        if (errorIds.includes(idPregunta)) setErrorIds(prev => prev.filter(id => id !== idPregunta));
    };

    const handleCheckboxChange = (idPregunta: number, idOpcion: number, checked: boolean) => {
        setRespuestas(prev => {
            const current = (prev[idPregunta] as number[]) || [];
            let nuevoState = [...current];
            if (checked) nuevoState.push(idOpcion);
            return { ...prev, [idPregunta]: nuevoState };
        });
        if (errorIds.includes(idPregunta)) setErrorIds(prev => prev.filter(id => id !== idPregunta));
    };

    const handleStart = () => {
        if (!selectedPaciente) {
            Swal.fire('Atención', 'Debes seleccionar un paciente.', 'warning');
            return;
        }
        setStep('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!encuesta) return;

        // Validación: Solo de preguntas visibles
        // Validación de preguntas visibles
        const newErrors: number[] = [];

        for (const p of visibleQuestions) {
            const r = respuestas[p.idPregunta];
            const estaVacio = r === undefined || r === null || r === "" || (Array.isArray(r) && r.length === 0);

            if (p.obligatoria && estaVacio) {
                newErrors.push(p.idPregunta);
            }
        }

        setErrorIds(newErrors);

        if (newErrors.length > 0) {
            const firstErrorId = newErrors[0];
            const p = visibleQuestions.find(q => q.idPregunta === firstErrorId);

            // Hacemos scroll inmediato (visual) al PRIMER error
            const element = document.getElementById(`pregunta-${firstErrorId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            await Swal.fire({
                title: 'Faltan datos',
                text: `Faltan preguntas obligatorias (marcadas en rojo). Por favor contéstalas.`, // Mensaje genérico mejorado
                icon: 'warning',
                confirmButtonText: 'Entendido',
                returnFocus: false, // CRÍTICO: No volver al botón save
                didClose: () => {
                    // Al cerrar, forzamos foco en el PRIMER error
                    const el = document.getElementById(`pregunta-${firstErrorId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        const input = el.querySelector('input, textarea, select') as HTMLElement;
                        if (input) {
                            input.focus({ preventScroll: true });
                        }
                    }
                }
            });
            return;
        }

        const token = localStorage.getItem('accessToken');

        // 2. Construcción correcta del Payload: Solo respuetas de preguntas visibles
        const respuestasEnviar: any[] = [];

        // Usamos visibleQuestions para filtrar qué respuestas enviar
        visibleQuestions.forEach(p => {
            const key = p.idPregunta;
            const valor = respuestas[key];

            // Si no hay respuesta (y era opcional), no la enviamos o la enviamos null? 
            // El backend suele ignorar si no se envía, pero si quieres borrar una respuesta previa...
            // Por simplicidad enviamos solo si existe valor
            if (valor === undefined || valor === null || valor === "") return;
            if (Array.isArray(valor) && valor.length === 0) return;

            if (p.tipoPregunta === 'SELECCION_MULTIPLE' && Array.isArray(valor)) {
                valor.forEach(idOp => {
                    respuestasEnviar.push({ idPregunta: key, idOpcionSeleccionada: idOp });
                });
            } else if (p.tipoPregunta.includes('SELECCION') && typeof valor === 'number') {
                respuestasEnviar.push({ idPregunta: key, idOpcionSeleccionada: valor });
            } else {
                respuestasEnviar.push({ idPregunta: key, valorTexto: String(valor) });
            }
        });

        // NOTA: El payload NO debe incluir respuestas de preguntas ocultas para evitar inconsistencias

        const payload = {
            idEncuesta: parseInt(idEncuesta!),
            idPaciente: parseInt(selectedPaciente),
            respuestas: respuestasEnviar
        };

        try {
            const res = await fetch('http://localhost:8080/api/v1/encuestas/registro', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await Swal.fire('¡Registrado!', 'Datos guardados.', 'success');
                router.push('/dashboard/encuesta');
            } else {
                // Manejo del error 403
                if (res.status === 403) {
                    Swal.fire('Error 403', 'No tienes permisos para guardar respuestas. Revisa tu rol o la configuración del Backend.', 'error');
                } else {
                    const txt = await res.text();
                    Swal.fire('Error', `Backend: ${txt}`, 'error');
                }
            }
        } catch (error) {
            Swal.fire('Error', 'Fallo de conexión.', 'error');
        }
    };

    const handleSaveDraft = async () => {
        if (!encuesta) return;

        if (!selectedPaciente) {
            Swal.fire({
                icon: 'warning',
                title: 'Selección Requerida',
                text: 'Por favor seleccione un paciente para guardar el borrador.',
                confirmButtonColor: '#f39c12'
            });
            return;
        }

        const token = localStorage.getItem('accessToken');

        // Construcción del Payload para borrador
        // Para borradores, quizás quieras guardar TODO, incluso ocultas, para no perder datos si el usuario cambia de opinión después?
        // Pero para ser consistente con la lógica de salto, mejor guardar solo lo visible o lo que el usuario "cree" que respondió.
        // Vamos a guardar solo visibles para mantener consistencia.
        const respuestasEnviar: any[] = [];

        visibleQuestions.forEach(p => {
            const key = p.idPregunta;
            const valor = respuestas[key];

            if (valor === undefined || valor === null || valor === "") return;
            if (Array.isArray(valor) && valor.length === 0) return;

            if (p.tipoPregunta === 'SELECCION_MULTIPLE' && Array.isArray(valor)) {
                valor.forEach(idOp => {
                    respuestasEnviar.push({ idPregunta: key, idOpcionSeleccionada: idOp });
                });
            } else if (p.tipoPregunta.includes('SELECCION') && typeof valor === 'number') {
                respuestasEnviar.push({ idPregunta: key, idOpcionSeleccionada: valor });
            } else {
                respuestasEnviar.push({ idPregunta: key, valorTexto: String(valor) });
            }
        });


        const payload = {
            idEncuesta: parseInt(idEncuesta!),
            idPaciente: parseInt(selectedPaciente),
            respuestas: respuestasEnviar,
            esBorrador: true
        };

        // ... (resto del fetch igual)
        try {
            const res = await fetch('http://localhost:8080/api/v1/encuestas/registro', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await Swal.fire({
                    icon: 'info',
                    title: 'Borrador Guardado',
                    text: 'Puedes continuar editando esta encuesta más tarde desde la sección de Borradores.',
                    confirmButtonColor: '#3498db',
                });
                router.push('/borradores');
            } else {
                const txt = await res.text();
                Swal.fire('Error', `No se pudo guardar el borrador: ${txt}`, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Fallo de conexión al guardar borrador.', 'error');
        }
    };

    if (!idEncuesta || loading) return <div className={styles.loading}>Cargando...</div>;
    if (!encuesta) return <div className={styles.error}>Encuesta no encontrada.</div>;

    if (step === 'intro') {
        return (
            <div className={styles.container}>
                <div className={styles.introCard}>
                    <button onClick={() => router.back()} className={styles.backButton}><FaArrowLeft /> Volver</button>
                    <div className={styles.iconBig}>📝</div>
                    <h1 className={styles.title}>{encuesta.titulo}</h1>
                    <div style={{ display: 'inline-block', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                        Versión {encuesta.version || '1.0'}
                    </div>
                    <p className={styles.desc}>Selecciona el paciente.</p>

                    <div className={styles.formGroup} style={{ marginBottom: '2rem', textAlign: 'left' }}>
                        <label className={styles.questionLabel} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaUserInjured /> Seleccionar Paciente:
                        </label>
                        <select className={styles.select} value={selectedPaciente} onChange={(e) => setSelectedPaciente(e.target.value)} style={{ width: '100%', padding: '10px' }}>
                            <option value="">-- Buscar Paciente --</option>
                            {pacientes.map(p => <option key={p.idPaciente} value={p.idPaciente}>{p.nombre} {p.apellidos}</option>)}
                        </select>
                    </div>
                    <button className={styles.startBtn} onClick={handleStart}>Comenzar Ahora</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <div className={styles.formHeader}>
                    <h2>{encuesta.titulo}</h2>
                    <small style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Paciente: {pacientes.find(p => p.idPaciente.toString() === selectedPaciente)?.nombre}</small>
                </div>
                <form onSubmit={handleSubmit}>
                    {visibleQuestions.map((p) => (
                        <div
                            key={p.idPregunta}
                            id={`pregunta-${p.idPregunta}`}
                            className={styles.questionBlock}
                            style={errorIds.includes(p.idPregunta) ? {
                                border: '1px solid #ff6b6b',
                                backgroundColor: 'rgba(255, 0, 0, 0.15)',
                                padding: '10px', // Asegurar padding extra si se resalta
                                borderRadius: '8px'
                            } : {}}
                        >
                            <label className={styles.questionLabel}>{p.textoPregunta} {p.obligatoria && <span className={styles.required}>*</span>}</label>
                            {(p.tipoPregunta === 'TEXTO' || p.tipoPregunta === 'TEXTO_LIBRE') && (
                                p.tipoPregunta === 'TEXTO' ?
                                    <input className={styles.input} value={respuestas[p.idPregunta] as string || ''} onChange={e => handleInputChange(p.idPregunta, e.target.value)} /> :
                                    <textarea className={styles.textarea} value={respuestas[p.idPregunta] as string || ''} onChange={e => handleInputChange(p.idPregunta, e.target.value)} />
                            )}
                            {p.tipoPregunta === 'NUMERO' && <input type="number" className={styles.input} value={respuestas[p.idPregunta] as string || ''} onChange={e => handleInputChange(p.idPregunta, e.target.value)} />}
                            {p.tipoPregunta === 'FECHA' && <input type="date" className={styles.input} value={respuestas[p.idPregunta] as string || ''} onChange={e => handleInputChange(p.idPregunta, e.target.value)} />}
                            {(p.tipoPregunta === 'SELECCION_UNICA' || p.tipoPregunta === 'SELECCION') && (
                                <div className={styles.optionsContainer}>
                                    {p.opciones?.map((op) => (
                                        <label key={op.idOpcion} className={styles.optionLabel}>
                                            <input type="radio" name={`p_${p.idPregunta}`} checked={respuestas[p.idPregunta] === op.idOpcion} onClick={() => handleRadioClick(p.idPregunta, op.idOpcion)} onChange={() => { }} />
                                            {op.textoOpcion}
                                        </label>
                                    ))}
                                </div>
                            )}
                            {p.tipoPregunta === 'SELECCION_MULTIPLE' && (
                                <div className={styles.optionsContainer}>
                                    {p.opciones?.map((op) => (
                                        <label key={op.idOpcion} className={styles.optionLabel}>
                                            <input type="checkbox" checked={((respuestas[p.idPregunta] as number[]) || []).includes(op.idOpcion)} onChange={(e) => handleCheckboxChange(p.idPregunta, op.idOpcion, e.target.checked)} />
                                            {op.textoOpcion}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <div className={styles.actions}>
                        <button type="submit" className={styles.btnPrimary}><FaPaperPlane style={{ marginRight: '5px' }} /> Guardar</button>
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                backgroundColor: '#95a5a6',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                            }}
                        >
                            <FaHistory /> Guardar Borrador
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}