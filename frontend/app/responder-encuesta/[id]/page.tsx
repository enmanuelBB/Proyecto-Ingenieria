"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
}

export default function ResponderEncuestaPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params; // This is a string

    const [encuesta, setEncuesta] = useState<Encuesta | null>(null);
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [selectedPacienteId, setSelectedPacienteId] = useState<number | string>("");

    // State to store answers: { [questionId]: { optionId: number | null, text: string | null } }
    const [respuestas, setRespuestas] = useState<Record<number, { optionId: number | null, text: string | null }>>({});

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

    const validateForm = (): boolean => {
        if (!encuesta) return false;
        if (!selectedPacienteId) {
            alert("Por favor seleccione un paciente.");
            return false;
        }

        for (const pregunta of encuesta.preguntas) {
            if (pregunta.obligatoria) {
                const respuesta = respuestas[pregunta.idPregunta];
                const hasAnswer = respuesta && (respuesta.optionId !== null || (respuesta.text && respuesta.text.trim().length > 0));

                if (!hasAnswer) {
                    alert(`La pregunta "${pregunta.textoPregunta}" es obligatoria.`);
                    return false;
                }
            }
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
                alert("¡Encuesta enviada con éxito!");
                router.push('/dashboard');
            } else {
                const errData = await res.text(); // Could be text or json
                alert("Error al enviar: " + errData);
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión al enviar la encuesta.");
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
                        <div key={pregunta.idPregunta} className={styles.questionBlock}>
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
                                                onChange={() => handleOptionChange(pregunta.idPregunta, opcion.idOpcion)}
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
                                    onChange={(e) => handleTextChange(pregunta.idPregunta, e.target.value)}
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
                    </div>
                </form>
            </div>
        </div>
    );
}
