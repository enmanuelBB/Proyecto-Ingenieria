"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './builder.module.css';
import { FaTimes, FaPlus, FaTrash, FaEdit, FaListUl, FaCheckCircle, FaSave, FaBan } from 'react-icons/fa';
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

export default function FormBuilderPage() {
    const router = useRouter();
    const params = useParams();
    const idEncuesta = params.id;

    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [loading, setLoading] = useState(true);

    // Estado de Edición
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [texto, setTexto] = useState("");
    const [tipo, setTipo] = useState("TEXTO"); 
    const [obligatoria, setObligatoria] = useState(false);
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
                    // Ordenamos por ID para mantener orden visual estable
                    const sorted = data.preguntas.sort((a: Pregunta, b: Pregunta) => a.idPregunta - b.idPregunta);
                    setPreguntas(sorted);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- LÓGICA DE EDICIÓN ---
    const handleEdit = (pregunta: Pregunta) => {
        setEditingId(pregunta.idPregunta);
        setTexto(pregunta.textoPregunta);
        setObligatoria(pregunta.obligatoria);

        // Normalizar el tipo para el Select
        let tipoUI = "TEXTO";
        if (pregunta.tipoPregunta === 'SELECCION_UNICA' || pregunta.tipoPregunta === 'SELECCION_MULTIPLE') {
            tipoUI = 'SELECCION';
        } else {
            tipoUI = pregunta.tipoPregunta; // NUMERO, FECHA, TEXTO
        }
        setTipo(tipoUI);

        // Cargar opciones si existen
        if (pregunta.opciones && pregunta.opciones.length > 0) {
            setOpcionesTxt(pregunta.opciones.map(o => o.textoOpcion).join(', '));
        } else {
            setOpcionesTxt("");
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTexto("");
        setTipo("TEXTO");
        setObligatoria(false);
        setOpcionesTxt("");
    };

    // --- GUARDAR (CREAR O ACTUALIZAR) ---
    const handleSaveQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!texto.trim()) return;

        const token = localStorage.getItem('accessToken');
        setSubmitting(true);

        let opcionesEnviar: any[] = [];
        if (tipo === 'SELECCION') { 
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
            let url = `http://localhost:8080/api/v1/encuestas/${idEncuesta}/preguntas`;
            let method = 'POST';

            // Si estamos editando, cambiamos URL y método
            if (editingId) {
                url = `http://localhost:8080/api/v1/encuestas/preguntas/${editingId}`;
                method = 'PUT';
            }

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: editingId ? 'Pregunta Actualizada' : 'Pregunta Agregada',
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchEncuesta();
                handleCancelEdit(); // Limpia el formulario y estado de edición
            } else {
                const errText = await res.text();
                Swal.fire('Error', `No se pudo guardar: ${errText}`, 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error de conexión', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (idPregunta: number) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`http://localhost:8080/api/v1/encuestas/preguntas/${idPregunta}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPreguntas(prev => prev.filter(p => p.idPregunta !== idPregunta));
                Swal.fire('Eliminado', 'La pregunta ha sido eliminada.', 'success');
                
                // Si borramos la que estábamos editando, limpiamos el form
                if (editingId === idPregunta) {
                    handleCancelEdit();
                }
            } else {
                Swal.fire('Error', 'No se pudo eliminar la pregunta', 'error');
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

                    {/* PANEL IZQUIERDO - CREAR / EDITAR */}
                    <aside className={styles.leftPanel}>
                        <div className={styles.sectionTitle}>
                            {editingId ? <FaEdit /> : <FaPlus />} 
                            {editingId ? ' Editar Variable' : ' Agregar Nueva Variable'}
                        </div>

                        <form onSubmit={handleSaveQuestion} className={styles.formGroup} style={{ gap: '1rem' }}>

                            {/* Pregunta */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Enunciado (Pregunta)</label>
                                <input
                                    className={styles.input}
                                    value={texto}
                                    onChange={e => setTexto(e.target.value)}
                                    placeholder="¿Cuál es su edad?"
                                    required
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

                                {/* Fake Section */}
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

                            {/* Botones de Acción */}
                            <div style={{display:'flex', gap:'0.5rem', marginTop:'1rem'}}>
                                <button 
                                    type="submit" 
                                    className={styles.addButton} 
                                    disabled={submitting}
                                    style={{flex: 1}}
                                >
                                    {editingId ? (
                                        <><FaSave style={{marginRight: '5px'}}/> Actualizar</>
                                    ) : (
                                        <><FaPlus style={{marginRight: '5px'}}/> Agregar</>
                                    )}
                                </button>

                                {editingId && (
                                    <button 
                                        type="button" 
                                        className={styles.addButton} 
                                        onClick={handleCancelEdit}
                                        style={{flex: 1, backgroundColor: 'var(--text-muted)', opacity: 0.8}}
                                    >
                                        <FaBan style={{marginRight: '5px'}}/> Cancelar
                                    </button>
                                )}
                            </div>

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
                                    <div key={p.idPregunta} className={styles.variableItem} style={editingId === p.idPregunta ? {borderLeft: '4px solid var(--primary)', backgroundColor: 'var(--bg-main)'} : {}}>
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
                                            <button 
                                                className={styles.iconBtn} 
                                                title="Editar"
                                                onClick={() => handleEdit(p)}
                                            >
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