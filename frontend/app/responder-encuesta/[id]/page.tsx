"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import styles from './responder.module.css';

// --- Interfaces based on Backend DTOs ---

interface OpcionRespuesta {
    idOpcion: number;
    textoOpcion: string;
    idPreguntaDestino?: number | null;
}

interface Pregunta {
    idPregunta: number;
    textoPregunta: string;
    tipoPregunta: string; // "TEXTO_LIBRE" or implicit via options
    obligatoria: boolean;
    opciones: OpcionRespuesta[];
}

interface Encuesta {
    idEncuesta: number;
    titulo: string;
    version?: string;
    preguntas: Pregunta[];
}

interface Paciente {
    idPaciente: number;
    rut: string;
    nombre: string;
    apellidos: string;
}

// Payload for Backend
interface RespuestaRequestDto {
    idPregunta: number;
    idOpcionSeleccionada?: number | null;
    valorTexto?: string | null;
}

interface RegistroRequestDto {
    idPaciente: number;
    idEncuesta: number;
    respuestas: RespuestaRequestDto[];
    esBorrador?: boolean;
}

export default function ResponderEncuestaPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ResponderEncuestaContent />
        </Suspense>
    );
}

function ResponderEncuestaContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const registroId = searchParams.get('registroId');
    const { id } = params; // This is a string

    const [encuesta, setEncuesta] = useState<Encuesta | null>(null);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [selectedPacienteId, setSelectedPacienteId] = useState<number | string>("");

    // State to store answers: { [questionId]: { optionId: number | null, text: string | null } }
    const [respuestas, setRespuestas] = useState<Record<number, { optionId: number | null, text: string | null }>>({});
    // New state for validation errors
    const [validationErrors, setValidationErrors] = useState<Set<number>>(new Set());

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/');
            return;
        }

        const fetchData = async () => {
            try {
                // 1. Fetch Survey
                const resEncuesta = await fetch(`http://localhost:8080/api/v1/encuestas/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!resEncuesta.ok) throw new Error("Error al cargar la encuesta.");
                const dataEncuesta = await resEncuesta.json();
                setEncuesta(dataEncuesta);

                // 2. Fetch Patients for the selector
                const resPacientes = await fetch('http://localhost:8080/api/v1/pacientes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (resPacientes.ok) {
                    const dataPacientes = await resPacientes.json();
                    setPacientes(dataPacientes);
                }

            } catch (err: any) {
                setError(err.message || "Error desconocido");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, router]);

    // Load Draft Data if registroId is present
    useEffect(() => {
        if (!registroId || !id) return;

        const fetchDraft = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            try {
                const res = await fetch(`http://localhost:8080/api/v1/encuestas/registro/${registroId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    // Pre-fill patient
                    setSelectedPacienteId(data.idPaciente);

                    // Pre-fill answers
                    const newRespuestas: Record<number, { optionId: number | null, text: string | null }> = {};

                    if (data.respuestas && Array.isArray(data.respuestas)) {
                        data.respuestas.forEach((r: any) => {
                            if (r.idPregunta) {
                                newRespuestas[r.idPregunta] = {
                                    optionId: r.idOpcionSeleccionada || null,
                                    text: r.respuestaDada || null
                                };

                                // Special case: if it has an option selected, clear text explicitly to match state logic
                                if (r.idOpcionSeleccionada) {
                                    newRespuestas[r.idPregunta].text = null;
                                } else {
                                    // If text, ensure optionId is null
                                    newRespuestas[r.idPregunta].optionId = null;
                                }
                            }
                        });
                        setRespuestas(newRespuestas);
                    }
                }
            } catch (err) {
                console.error("Error loading draft", err);
            }
        };

        fetchDraft();
    }, [registroId, id]);

    const handleOptionChange = (questionId: number, optionId: number) => {
        setRespuestas(prev => ({
            ...prev,
            [questionId]: { optionId: optionId, text: null } // Clear text if option selected
        }));
    };

    const handleTextChange = (questionId: number, text: string) => {
        setRespuestas(prev => ({
            ...prev,
            [questionId]: { optionId: null, text: text }
        }));
    };

    const clearError = (questionId: number) => {
        if (validationErrors.has(questionId)) {
            setValidationErrors(prev => {
                const next = new Set(prev);
                next.delete(questionId);
                return next;
            });
        }
    }

    // Wrap handlers to clear errors on interaction
    const handleOptionChangeWrapped = (questionId: number, optionId: number) => {
        handleOptionChange(questionId, optionId);
        clearError(questionId);
    };

    const handleTextChangeWrapped = (questionId: number, text: string) => {
        handleTextChange(questionId, text);
        clearError(questionId);
    };

    const validateForm = (): boolean => {
        if (!encuesta) return false;
        if (!selectedPacienteId) {
            Swal.fire({
                icon: 'warning',
                title: 'Selección Requerida',
                text: 'Por favor seleccione un paciente.',
                confirmButtonColor: '#f39c12'
            });
            return false;
        }

        const newErrors = new Set<number>();
        let firstErrorId: number | null = null;

        for (const pregunta of encuesta.preguntas) {
            if (pregunta.obligatoria) {
                const respuesta = respuestas[pregunta.idPregunta];
                const hasAnswer = respuesta && (respuesta.optionId !== null || (respuesta.text && respuesta.text.trim().length > 0));

                if (!hasAnswer) {
                    newErrors.add(pregunta.idPregunta);
                    if (firstErrorId === null) {
                        firstErrorId = pregunta.idPregunta;
                    }
                }
            }
        }

        setValidationErrors(newErrors);

        if (newErrors.size > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos Incompletos',
                text: 'Por favor, responda todas las preguntas obligatorias resaltadas.',
                confirmButtonColor: '#f39c12',
                willClose: () => {
                    if (firstErrorId !== null) {
                        const element = document.getElementById(`pregunta-${firstErrorId}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.focus(); // Accessibility: focus the element if possible (divs usually need tabindex)
                        }
                    }
                }
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!encuesta) return;

        setSubmitting(true);
        const token = localStorage.getItem('accessToken');

        // Construct Payload
        const respuestasList: RespuestaRequestDto[] = Object.entries(respuestas).map(([qId, ans]) => ({
            idPregunta: Number(qId),
            idOpcionSeleccionada: ans.optionId || (null as any),
            valorTexto: ans.text || null
        }));

        const payload: RegistroRequestDto = {
            idPaciente: Number(selectedPacienteId),
            idEncuesta: encuesta.idEncuesta,
            respuestas: respuestasList
        };

        try {
            const res = await fetch('http://localhost:8080/api/v1/encuestas/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Registro Exitoso!',
                    text: 'El formulario clínico ha sido guardado y asociado al paciente correctamente.',
                    confirmButtonColor: '#3085d6',
                });
                router.push('/dashboard');
            } else {
                const errData = await res.text(); // Could be text or json
                Swal.fire({
                    icon: 'error',
                    title: 'Error al enviar',
                    text: errData || 'Ocurrió un error al enviar la encuesta.',
                    confirmButtonColor: '#d33',
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'No se pudo conectar con el servidor para enviar la encuesta.',
                confirmButtonColor: '#d33',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!encuesta) return;
        if (!selectedPacienteId) {
            Swal.fire({
                icon: 'warning',
                title: 'Selección Requerida',
                text: 'Por favor seleccione un paciente para guardar el borrador.',
                confirmButtonColor: '#f39c12'
            });
            return;
        }

        setSubmitting(true);
        const token = localStorage.getItem('accessToken');

        const respuestasList: RespuestaRequestDto[] = Object.entries(respuestas).map(([qId, ans]) => ({
            idPregunta: Number(qId),
            idOpcionSeleccionada: ans.optionId || (null as any),
            valorTexto: ans.text || null
        }));

        const payload: RegistroRequestDto = {
            idPaciente: Number(selectedPacienteId),
            idEncuesta: encuesta.idEncuesta,
            respuestas: respuestasList,
            esBorrador: true
        };

        try {
            const res = await fetch('http://localhost:8080/api/v1/encuestas/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await Swal.fire({
                    icon: 'info',
                    title: 'Borrador Guardado',
                    text: 'Puede continuar editando esta encuesta más tarde desde la sección de Borradores.',
                    confirmButtonColor: '#3085d6',
                });
                router.push('/dashboard');
            } else {
                const errData = await res.text();
                Swal.fire({
                    icon: 'error',
                    title: 'Error al guardar',
                    text: errData || 'Ocurrió un error al guardar el borrador.',
                    confirmButtonColor: '#d33',
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'No se pudo conectar con el servidor.',
                confirmButtonColor: '#d33',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className={styles.container}><p>Cargando encuesta...</p></div>;
    if (error) return <div className={styles.container}><p className={styles.error}>{error}</p></div>;
    if (!encuesta) return <div className={styles.container}><p>No se encontró la encuesta.</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{encuesta.titulo}</h1>
                    {encuesta.version && <span className={styles.version}>Versión: {encuesta.version}</span>}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Patient Selector */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Seleccionar Paciente:</label>
                        <select
                            className={styles.select}
                            value={selectedPacienteId}
                            onChange={(e) => setSelectedPacienteId(e.target.value)}
                        >
                            <option value="">-- Seleccione un Paciente --</option>
                            {pacientes.map(p => (
                                <option key={p.idPaciente} value={p.idPaciente}>
                                    {p.nombre} {p.apellidos} ({p.rut})
                                </option>
                            ))}
                        </select>
                    </div>

                    <hr className="my-6 border-gray-200" />

                    {/* Questions Loop */}
                    {encuesta.preguntas.map((pregunta) => (
                        <div
                            key={pregunta.idPregunta}
                            id={`pregunta-${pregunta.idPregunta}`}
                            className={`${styles.questionBlock} ${validationErrors.has(pregunta.idPregunta) ? styles.questionError : ''}`}
                        >
                            <p className={styles.questionText}>
                                {pregunta.textoPregunta}
                                {pregunta.obligatoria && <span className={styles.required}>*</span>}
                            </p>

                            {/* Logic to determine Input Type based on Options */}
                            {pregunta.opciones && pregunta.opciones.length > 0 ? (
                                <div className={styles.radioGroup}>
                                    {pregunta.opciones.map(opcion => (
                                        <label key={opcion.idOpcion} className={styles.radioOption}>
                                            <input
                                                type="radio"
                                                name={`q_${pregunta.idPregunta}`}
                                                className={styles.radioInput}
                                                checked={respuestas[pregunta.idPregunta]?.optionId === opcion.idOpcion}
                                                onChange={() => handleOptionChangeWrapped(pregunta.idPregunta, opcion.idOpcion)}
                                            />
                                            {opcion.textoOpcion}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Escriba su respuesta aquí..."
                                    value={respuestas[pregunta.idPregunta]?.text || ''}
                                    onChange={(e) => handleTextChangeWrapped(pregunta.idPregunta, e.target.value)}
                                />
                            )}
                        </div>
                    ))}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => router.back()}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={submitting}
                        >
                            {submitting ? 'Enviando...' : 'Enviar Encuesta'}
                        </button>
                        <button
                            type="button"
                            className={styles.draftButton}
                            onClick={handleSaveDraft}
                            disabled={submitting}
                            style={{ marginLeft: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            Guardar Borrador
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
