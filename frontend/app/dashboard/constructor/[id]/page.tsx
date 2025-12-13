"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './builder.module.css';
import { FaTimes, FaPlus, FaTrash, FaEdit, FaListUl, FaCheckCircle } from 'react-icons/fa';

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

export default function FormBuilderPage() {
    const router = useRouter();
    const params = useParams();
    const idEncuesta = params.id;

    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [texto, setTexto] = useState("");
    const [tipo, setTipo] = useState("TEXTO"); // TEXTO, NUMERO, FECHA, SELECCION
    const [obligatoria, setObligatoria] = useState(false);

    // Opciones para Selección Múltiple
    const [opcionesTxt, setOpcionesTxt] = useState(""); 
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEncuesta();
    }, [idEncuesta]);

    const fetchEncuesta = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !idEncuesta) return;

        try {
            setLoading(true);
            const res = await fetch(`http://localhost:8080/api/v1/encuestas/${idEncuesta}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.preguntas) {
                    setPreguntas(data.preguntas);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!texto.trim()) return;

        const token = localStorage.getItem('accessToken');
        setSubmitting(true);

        let opcionesEnviar: any[] = [];
        if (tipo === 'SELECCION' || tipo === 'RADIO') { 
            opcionesEnviar = opcionesTxt.split(',').map(o => ({ textoOpcion: o.trim() })).filter(o => o.textoOpcion.length > 0);
        }

        let tipoBackend = tipo;
        if (tipo === 'SELECCION') tipoBackend = 'SELECCION_UNICA'; 

        const payload = {
            textoPregunta: texto,
            tipoPregunta: tipoBackend,
            obligatoria: obligatoria,
            opciones: opcionesEnviar
        };

        try {
            const res = await fetch(`http://localhost:8080/api/v1/encuestas/${idEncuesta}/preguntas`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchEncuesta();
                setTexto("");
                setOpcionesTxt("");
                setObligatoria(false);
                setTipo("TEXTO");
            } else {
                console.error("Error creating question");
                alert("Error al guardar la pregunta. Verifique los datos.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (idPregunta: number) => {
        if (!confirm("¿Estás seguro de eliminar esta pregunta?")) return;
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://localhost:8080/api/v1/encuestas/preguntas/${idPregunta}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPreguntas(prev => prev.filter(p => p.idPregunta !== idPregunta));
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.builderCard}>

                {/* HEADER */}
                <header className={styles.header}>
                    <div className={styles.title}>Personalizar Formulario (Variables)</div>
                    <button className={styles.closeButton} onClick={() => router.back()}>
                        <FaTimes />
                    </button>
                </header>

                <div className={styles.content}>

                    {/* PANEL IZQUIERDO - CREAR */}
                    <aside className={styles.leftPanel}>
                        <div className={styles.sectionTitle}>
                            <FaPlus /> Agregar Nueva Variable
                        </div>

                        <form onSubmit={handleAddQuestion} className={styles.formGroup} style={{ gap: '1rem' }}>

                            {/* Pregunta */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Enunciado (Pregunta)</label>
                                <input
                                    className={styles.input}
                                    value={texto}
                                    onChange={e => setTexto(e.target.value)}
                                    placeholder="¿Cuál es su edad?"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {/* Tipo */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Tipo de Dato</label>
                                    <select
                                        className={styles.select}
                                        value={tipo}
                                        onChange={e => setTipo(e.target.value)}
                                    >
                                        <option value="TEXTO">Texto</option>
                                        <option value="NUMERO">Número</option>
                                        <option value="FECHA">Fecha</option>
                                        <option value="SELECCION">Selección (Opciones)</option>
                                    </select>
                                </div>

                                {/* Fake Section (Visual Only) */}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Sección</label>
                                    <select className={styles.select} disabled>
                                        <option>General</option>
                                    </select>
                                </div>
                            </div>

                            {/* Opciones (Solo si es Selección) */}
                            {tipo === 'SELECCION' && (
                                <div className={styles.optionsContainer}>
                                    <label className={styles.label} style={{ color: 'var(--text-muted)' }}>Opciones (separadas por coma)</label>
                                    <textarea
                                        className={styles.input}
                                        value={opcionesTxt}
                                        onChange={e => setOpcionesTxt(e.target.value)}
                                        placeholder="Si, No, Tal vez..."
                                        rows={3}
                                    />
                                </div>
                            )}

                            <div className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="obligatoria"
                                    checked={obligatoria}
                                    onChange={e => setObligatoria(e.target.checked)}
                                />
                                <label htmlFor="obligatoria" className={styles.label} style={{ cursor: 'pointer' }}>Es obligatoria</label>
                            </div>

                            {/* Botón Guardar */}
                            <button type="submit" className={styles.addButton} disabled={submitting}>
                                {submitting ? 'Guardando...' : 'Agregar Variable'}
                            </button>

                        </form>
                    </aside>

                    {/* PANEL DERECHO - LISTA */}
                    <section className={styles.rightPanel}>
                        <div className={styles.listHeader}>
                            <h3 className={styles.sectionTitle} style={{ color: 'var(--text-main)' }}>
                                <FaListUl /> Variables Existentes
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--border-color)' }}>
                                <span>Enunciado</span>
                                <span>Tipo</span>
                                <span>Oblig.</span>
                                <span style={{ textAlign: 'right' }}>Acciones</span>
                            </div>
                        </div>

                        <div className={styles.listContent}>
                            {loading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando variables...</div>
                            ) : preguntas.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay preguntas configuradas.</div>
                            ) : (
                                preguntas.map((p) => (
                                    <div key={p.idPregunta} className={styles.variableItem}>
                                        <div className={styles.variableInfo} style={{ flex: 3 }}>
                                            <span className={styles.variableCode}>{p.textoPregunta}</span>
                                            {p.opciones && p.opciones.length > 0 && (
                                                <span className={styles.variableText}>
                                                    Opciones: {p.opciones.map(o => o.textoOpcion).join(', ')}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <span className={styles.badge}>{p.tipoPregunta}</span>
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            {p.obligatoria ? <FaCheckCircle color="#22c55e" /> : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                        </div>

                                        <div className={styles.actions} style={{ flex: 1, justifyContent: 'flex-end' }}>
                                            <button className={styles.iconBtn} title="Editar (No implementado)">
                                                <FaEdit />
                                            </button>
                                            <button
                                                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                                onClick={() => handleDelete(p.idPregunta)}
                                                title="Eliminar"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}