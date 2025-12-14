"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './builder.module.css';
import {
    FaTimes, FaPlus, FaTrash, FaEdit, FaListUl, FaCheckCircle,
    FaSave, FaBan, FaExchangeAlt, FaPen
} from 'react-icons/fa';
import Swal from 'sweetalert2';

// --- INTERFACES ---
interface Opcion {
    textoOpcion: string;
    idPreguntaDestino?: number | null;
}

interface Pregunta {
    idPregunta: number;
    textoPregunta: string;
    tipoPregunta: string;
    obligatoria: boolean;
    opciones: Opcion[];
}

interface EncuestaSimple {
    idEncuesta: number;
    titulo: string;
    descripcion: string;
}

export default function FormBuilderPage() {
    const router = useRouter();
    const params = useParams();


    const idEncuesta = params && params.id ? String(params.id) : null;

    // --- ESTADOS GLOBALES ---
    const [listaEncuestas, setListaEncuestas] = useState<EncuestaSimple[]>([]);
    const [encuestaActual, setEncuestaActual] = useState<EncuestaSimple | null>(null);
    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADO EDICIÓN PREGUNTA ---
    const [editingId, setEditingId] = useState<number | null>(null);

    // --- FORMULARIO PREGUNTA ---
    const [texto, setTexto] = useState("");
    const [tipo, setTipo] = useState("TEXTO");
    const [obligatoria, setObligatoria] = useState(false);
    const [opcionesLista, setOpcionesLista] = useState<Opcion[]>([]);
    const [nuevaOpcion, setNuevaOpcion] = useState("");
    const [nuevaOpcionDestino, setNuevaOpcionDestino] = useState<number | string>("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (idEncuesta) {
            fetchAllEncuestas();
            fetchEncuestaData();
        }
    }, [idEncuesta]);

    // 1. Obtener lista para el selector
    const fetchAllEncuestas = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        try {
            const res = await fetch('http://localhost:8080/api/v1/encuestas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setListaEncuestas(data);
            }
        } catch (e) {
            console.error("Error al cargar lista de encuestas", e);
        }
    };

    // 2. Obtener datos de la encuesta actual (Preguntas + Metadata)
    const fetchEncuestaData = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || !idEncuesta) return;

        try {
            setLoading(true);
            setEditingId(null);
            handleCancelEdit();

            const res = await fetch(`http://localhost:8080/api/v1/encuestas/${idEncuesta}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();

                // Guardamos metadata de la encuesta
                setEncuestaActual({
                    idEncuesta: data.idEncuesta,
                    titulo: data.titulo,
                    descripcion: data.descripcion
                });

                if (data.preguntas) {
                    const sorted = data.preguntas.sort((a: Pregunta, b: Pregunta) => a.idPregunta - b.idPregunta);
                    setPreguntas(sorted);
                } else {
                    setPreguntas([]);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- CAMBIAR DE ENCUESTA (SELECTOR) ---
    const handleChangeSurvey = (newId: string) => {
        if (newId && newId !== idEncuesta) {
            setLoading(true);
            router.push(`/dashboard/constructor/${newId}`);
        }
    };

    // --- EDITAR METADATA DE ENCUESTA (TITULO/DESCRIPCION) ---
    const handleEditSurveyMetadata = async () => {
        if (!encuestaActual || !idEncuesta) return;

        const { value: formValues } = await Swal.fire({
            title: 'Editar Detalles de Encuesta',
            html:
                `<input id="swal-input1" class="swal2-input" placeholder="Título" value="${encuestaActual.titulo}">` +
                `<textarea id="swal-input2" class="swal2-textarea" placeholder="Descripción">${encuestaActual.descripcion || ''}</textarea>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar Cambios',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return [
                    (document.getElementById('swal-input1') as HTMLInputElement).value,
                    (document.getElementById('swal-input2') as HTMLTextAreaElement).value
                ]
            }
        });

        if (formValues) {
            const [newTitle, newDesc] = formValues;
            if (!newTitle) return Swal.fire('Error', 'El título es obligatorio', 'error');

            const token = localStorage.getItem('accessToken');
            try {
                const res = await fetch(`http://localhost:8080/api/v1/encuestas/${idEncuesta}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        titulo: newTitle,
                        descripcion: newDesc
                    })
                });

                if (res.ok) {
                    Swal.fire('Actualizado', 'La información de la encuesta ha sido actualizada.', 'success');
                    fetchEncuestaData(); // Recargar datos
                    fetchAllEncuestas(); // Actualizar lista del selector también
                } else {
                    Swal.fire('Error', 'No se pudo actualizar la encuesta.', 'error');
                }
            } catch (e) {
                console.error(e);
                Swal.fire('Error', 'Fallo de conexión.', 'error');
            }
        }
    };

    // --- MANEJO DE OPCIONES (PREGUNTA) ---
    const handleAddOption = (e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        const valor = nuevaOpcion.trim();
        if (!valor) return;

        // Validar duplicados (solo texto)
        if (opcionesLista.some(op => op.textoOpcion === valor)) {
            Swal.fire({
                toast: true, position: 'top-end', icon: 'warning',
                title: 'Opción duplicada', showConfirmButton: false, timer: 2000
            });
            return;
        }

        const destino = nuevaOpcionDestino ? Number(nuevaOpcionDestino) : null;
        setOpcionesLista([...opcionesLista, { textoOpcion: valor, idPreguntaDestino: destino }]);
        setNuevaOpcion("");
        setNuevaOpcionDestino("");
    };

    const handleRemoveOption = (index: number) => {
        const nuevas = [...opcionesLista];
        nuevas.splice(index, 1);
        setOpcionesLista(nuevas);
    };

    const handleUpdateOptionJump = (index: number, idDestino: string) => {
        const nuevas = [...opcionesLista];
        nuevas[index].idPreguntaDestino = idDestino ? Number(idDestino) : null;
        setOpcionesLista(nuevas);
    };

    const handleKeyDownOption = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddOption();
        }
    };

    // --- CRUD PREGUNTAS ---
    const handleEdit = (p: Pregunta) => {
        setEditingId(p.idPregunta);
        setTexto(p.textoPregunta);
        setObligatoria(p.obligatoria);

        let tipoUI = "TEXTO";

        if (p.tipoPregunta.includes('SELECCION')) {
            tipoUI = 'SELECCION';
            if (p.opciones && p.opciones.length > 0) {
                // Copia opciones existentes
                setOpcionesLista(p.opciones.map(o => ({
                    textoOpcion: o.textoOpcion,
                    idPreguntaDestino: o.idPreguntaDestino
                } as Opcion)));
            } else {
                setOpcionesLista([]);
            }
        } else if (p.tipoPregunta === 'TEXTO_LIBRE') {
            tipoUI = "TEXTO";
            setOpcionesLista([]);
        } else {
            tipoUI = p.tipoPregunta; // NUMERO, FECHA
            setOpcionesLista([]);
        }
        setTipo(tipoUI);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTexto("");
        setTipo("TEXTO");
        setObligatoria(false);
        setOpcionesLista([]);
        setNuevaOpcionDestino("");
    };

    const handleSaveQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!texto.trim()) return;

        if (tipo === 'SELECCION' && opcionesLista.length === 0) {
            Swal.fire('Atención', 'Agrega al menos una opción.', 'warning');
            return;
        }

        const token = localStorage.getItem('accessToken');
        setSubmitting(true);

        let opcionesEnviar: any[] = [];
        let tipoBackend = tipo;

        // Mapeo UI -> Backend
        if (tipo === 'SELECCION') {
            // Enviamos los objetos Opcion completos (texto + idDestino)
            opcionesEnviar = opcionesLista;
            tipoBackend = 'SELECCION_UNICA';
        } else if (tipo === 'TEXTO') {
            tipoBackend = 'TEXTO_LIBRE';
        }

        const payload = {
            textoPregunta: texto,
            tipoPregunta: tipoBackend,
            obligatoria: obligatoria,
            opciones: opcionesEnviar
        };

        try {
            let url = `http://localhost:8080/api/v1/encuestas/${idEncuesta}/preguntas`;
            let method = 'POST';

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
                    title: editingId ? 'Variable Actualizada' : 'Variable Agregada',
                    timer: 1000, showConfirmButton: false
                });
                fetchEncuestaData();
                handleCancelEdit();
            } else {
                const err = await res.text();
                Swal.fire('Error', `Error al guardar: ${err}`, 'error');
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
            title: '¿Eliminar variable?',
            text: "No podrás deshacer esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: 'var(--bg-input)',
            confirmButtonText: 'Eliminar',
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
                if (editingId === idPregunta) handleCancelEdit();
                Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1000, showConfirmButton: false });
            }
        } catch (e) { console.error(e); }
    };

    // Si no hay ID, mostramos carga
    if (!idEncuesta) return <div className={styles.container}><div className={styles.loading}>Cargando constructor...</div></div>;

    return (
        <div className={styles.container}>
            <div className={styles.builderCard}>

                {/* HEADER MEJORADO */}
                <header className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>

                        {/* Selector de Encuesta */}
                        <div style={{ position: 'relative' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Cambiando encuesta:</div>
                            <select
                                className={styles.select}
                                value={idEncuesta}
                                onChange={(e) => handleChangeSurvey(e.target.value)}
                                style={{
                                    minWidth: '220px',
                                    fontWeight: 'bold',
                                    paddingRight: '2rem',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-main)',
                                    backgroundColor: 'var(--bg-input)'
                                }}
                            >
                                {listaEncuestas.map(e => (
                                    <option key={e.idEncuesta} value={e.idEncuesta}>
                                        {e.titulo}
                                    </option>
                                ))}
                            </select>
                            <FaExchangeAlt
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '28px', // Ajuste visual
                                    color: 'var(--primary)',
                                    pointerEvents: 'none',
                                    fontSize: '0.8rem'
                                }}
                            />
                        </div>

                        {/* Título de Encuesta Actual + Botón Editar */}
                        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Título actual:</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)' }}>
                                    {encuestaActual ? encuestaActual.titulo : 'Cargando...'}
                                </h2>
                                <button
                                    onClick={handleEditSurveyMetadata}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
                                    }}
                                    title="Editar nombre y descripción de la encuesta"
                                >
                                    <FaPen size={14} />
                                </button>
                            </div>
                        </div>

                    </div>

                    <button className={styles.closeButton} onClick={() => router.back()} title="Salir">
                        <FaTimes />
                    </button>
                </header>

                <div className={styles.content}>

                    {/* PANEL IZQUIERDO */}
                    <aside className={styles.leftPanel}>
                        <div className={styles.sectionTitle}>
                            {editingId ? <FaEdit /> : <FaPlus />}
                            {editingId ? ' Editar Variable' : ' Agregar Nueva Variable'}
                        </div>

                        <form onSubmit={handleSaveQuestion} className={styles.formGroup} style={{ gap: '1rem' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Enunciado (Pregunta)</label>
                                <input className={styles.input} value={texto} onChange={e => setTexto(e.target.value)} placeholder="Ej: ¿Cuál es su edad?" required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Tipo de Dato</label>
                                    <select className={styles.select} value={tipo} onChange={e => setTipo(e.target.value)}>
                                        <option value="TEXTO">Texto</option>
                                        <option value="NUMERO">Número</option>
                                        <option value="FECHA">Fecha</option>
                                        <option value="SELECCION">Selección (Opciones)</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Sección</label>
                                    <select className={styles.select} disabled><option>General</option></select>
                                </div>
                            </div>

                            {tipo === 'SELECCION' && (
                                <div className={styles.optionsContainer}>
                                    <label className={styles.label} style={{ color: 'var(--text-muted)' }}>Opciones</label>

                                    {/* INPUT NUEVA OPCION */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', backgroundColor: 'var(--bg-input)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>Nueva Opción</div>
                                        <input
                                            className={styles.input}
                                            value={nuevaOpcion}
                                            onChange={(e) => setNuevaOpcion(e.target.value)}
                                            onKeyDown={handleKeyDownOption}
                                            placeholder="Escribe el texto de la opción..."
                                            style={{ width: '100%', boxSizing: 'border-box' }}
                                        />

                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            {/* Selector de salto para nueva opción */}
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0 5px', backgroundColor: 'var(--bg-input)' }}>
                                                <FaExchangeAlt color="var(--text-muted)" size={12} />
                                                <select
                                                    value={nuevaOpcionDestino}
                                                    onChange={(e) => setNuevaOpcionDestino(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        border: 'none',
                                                        outline: 'none',
                                                        fontSize: '0.8rem',
                                                        padding: '8px 0',
                                                        color: 'var(--text-main)',
                                                        backgroundColor: 'transparent'
                                                    }}
                                                    title="Si selecciona esta opción, saltar a..."
                                                >
                                                    <option style={{ backgroundColor: 'var(--bg-card)' }} value="">(Ir a la siguiente)</option>
                                                    {preguntas
                                                        .filter(p => !editingId || p.idPregunta !== editingId)
                                                        .map(p => (
                                                            <option style={{ backgroundColor: 'var(--bg-card)' }} key={p.idPregunta} value={p.idPregunta}>
                                                                Saltar a: {p.textoPregunta.length > 25 ? p.textoPregunta.substring(0, 25) + '...' : p.textoPregunta}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleAddOption}
                                                style={{
                                                    backgroundColor: 'var(--primary)',
                                                    color: 'white',
                                                    borderRadius: '6px',
                                                    width: '40px',
                                                    height: '35px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                                title="Agregar esta opción"
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>
                                    </div>

                                    {/* LISTA OPCIONES */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                                        {opcionesLista.map((op, idx) => (
                                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-card)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', gap: '5px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{op.textoOpcion}</span>
                                                    <button type="button" onClick={() => handleRemoveOption(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FaTrash size={12} /></button>
                                                </div>

                                                {/* Selector de salto inline */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    <FaExchangeAlt size={10} style={{ color: op.idPreguntaDestino ? 'var(--primary)' : 'var(--text-muted)' }} /> Salta a:
                                                    <select
                                                        value={op.idPreguntaDestino || ""}
                                                        onChange={(e) => handleUpdateOptionJump(idx, e.target.value)}
                                                        style={{
                                                            border: '1px solid var(--border-color)',
                                                            borderRadius: '4px',
                                                            padding: '2px 4px',
                                                            fontSize: '0.75rem',
                                                            backgroundColor: op.idPreguntaDestino ? 'rgba(79, 70, 229, 0.1)' : 'var(--bg-input)',
                                                            color: op.idPreguntaDestino ? 'var(--primary)' : 'var(--text-muted)',
                                                            flex: 1,
                                                            outline: 'none'
                                                        }}
                                                    >
                                                        <option style={{ backgroundColor: 'var(--bg-card)' }} value="">(Siguiente pregunta)</option>
                                                        {preguntas
                                                            .filter(p => !editingId || p.idPregunta !== editingId) // Filtrar la propia pregunta
                                                            .sort((a, b) => a.idPregunta - b.idPregunta)
                                                            .map(p => (
                                                                <option style={{ backgroundColor: 'var(--bg-card)' }} key={p.idPregunta} value={p.idPregunta}>
                                                                    {p.textoPregunta.length > 20 ? p.textoPregunta.substring(0, 20) + '...' : p.textoPregunta}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


                            <div className={styles.checkboxGroup}>
                                <input type="checkbox" id="obligatoria" checked={obligatoria} onChange={e => setObligatoria(e.target.checked)} />
                                <label htmlFor="obligatoria" className={styles.label} style={{ cursor: 'pointer' }}>Es obligatoria</label>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button type="submit" className={styles.addButton} disabled={submitting} style={{ flex: 1 }}>
                                    {editingId ? <><FaSave style={{ marginRight: '5px' }} /> Actualizar</> : <><FaPlus style={{ marginRight: '5px' }} /> Agregar</>}
                                </button>
                                {editingId && (
                                    <button type="button" className={styles.addButton} onClick={handleCancelEdit} style={{ flex: 1, backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                                        <FaBan style={{ marginRight: '5px' }} /> Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </aside>

                    {/* PANEL DERECHO */}
                    <section className={styles.rightPanel}>
                        <div className={styles.listHeader}>
                            <h3 className={styles.sectionTitle} style={{ color: 'var(--text-main)' }}>
                                <FaListUl /> Variables en: {encuestaActual?.titulo}
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
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando datos...</div>
                            ) : preguntas.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Esta encuesta no tiene variables definidas.</div>
                            ) : (
                                preguntas.map((p) => (
                                    <div key={p.idPregunta} className={styles.variableItem} style={editingId === p.idPregunta ? { borderLeft: '4px solid var(--primary)', backgroundColor: 'var(--bg-main)' } : {}}>
                                        <div className={styles.variableInfo} style={{ flex: 3 }}>
                                            <span className={styles.variableCode}>{p.textoPregunta}</span>
                                            {p.opciones && p.opciones.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                                    {p.opciones.slice(0, 3).map((o, i) => (
                                                        <span key={i} style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-input)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{o.textoOpcion}</span>
                                                    ))}
                                                    {p.opciones.length > 3 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>+{p.opciones.length - 3}</span>}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}><span className={styles.badge}>{p.tipoPregunta}</span></div>
                                        <div style={{ flex: 1 }}>{p.obligatoria ? <FaCheckCircle color="#22c55e" /> : <span style={{ color: 'var(--text-muted)' }}>-</span>}</div>
                                        <div className={styles.actions} style={{ flex: 1, justifyContent: 'flex-end' }}>
                                            <button className={styles.iconBtn} title="Editar Variable" onClick={() => handleEdit(p)}><FaEdit /></button>
                                            <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(p.idPregunta)} title="Eliminar Variable"><FaTrash /></button>
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