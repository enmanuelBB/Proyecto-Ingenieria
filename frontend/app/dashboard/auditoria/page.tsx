"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './audit.module.css';
import { FaEdit, FaShieldAlt, FaExclamationTriangle, FaDoorOpen, FaSearch, FaArrowRight } from 'react-icons/fa';

interface RegistroLog {
    idRegistro: number;
    nombrePaciente: string;
    usuarioNombre: string;
    fechaRealizacion: string;
    tituloEncuesta: string;
}

export default function AuditPage() {
    const router = useRouter();
    const [allLogs, setAllLogs] = useState<RegistroLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<RegistroLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("24h");

    const [stats, setStats] = useState({
        accesos: 0,
        modificaciones: 0,
        alertas: 0,
        cierres: 0
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const [selectedUser, setSelectedUser] = useState("all");
    const [selectedType, setSelectedType] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        applyFilters();
    }, [allLogs, period, selectedUser, selectedType, searchTerm]);

    const fetchLogs = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            setLoading(true);
            const resEncuestas = await fetch('http://localhost:8080/api/v1/encuestas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            let logsFetched: RegistroLog[] = [];

            if (resEncuestas.ok) {
                const encuestas: any[] = await resEncuestas.json();
                const targetSurvey = encuestas.find(e => e.titulo.includes("Estudio")) || encuestas[0];

                if (targetSurvey) {
                    const resReg = await fetch(`http://localhost:8080/api/v1/encuestas/${targetSurvey.idEncuesta}/registros`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (resReg.ok) {
                        logsFetched = await resReg.json();
                    }
                }
            }
            logsFetched.sort((a, b) => new Date(b.fechaRealizacion).getTime() - new Date(a.fechaRealizacion).getTime());
            setAllLogs(logsFetched);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        const now = new Date();
        let cutoff = new Date();

        if (period === '24h') cutoff.setDate(now.getDate() - 1);
        else if (period === '7d') cutoff.setDate(now.getDate() - 7);
        else if (period === '30d') cutoff.setDate(now.getDate() - 30);

        let filtered = allLogs.filter(l => new Date(l.fechaRealizacion) >= cutoff);

        // Filter by User
        if (selectedUser !== 'all') {
            filtered = filtered.filter(l => (l.usuarioNombre || 'Sistema') === selectedUser);
        }

        // Filter by Type (Mock logic as data is only 'Respuesta')
        if (selectedType !== 'all') {
            if (selectedType === 'RESPUESTA') {
                // Keep all since they are all responses
            } else {
                // If filtering by access/alert/closure, return empty as we don't have those logs yet
                filtered = [];
            }
        }

        // Filter by Search Term (Patient Name)
        if (searchTerm.trim() !== "") {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(l => l.nombrePaciente && l.nombrePaciente.toLowerCase().includes(lowerTerm));
        }

        setFilteredLogs(filtered);
    };

    const calculateStats = () => {
        // Only used for the cards now, filtering is separate
        // ... existing stats logic (simplified since applyFilters handles the list)
        // We can reuse filteredLogs for stats or recalculate if stats should be period-only independent of user filter?
        // Usually Stats Cards reflect the period, not necessarily the specific list filters unless desired.
        // Let's keep stats based on Period Only to show "Global Activity" vs "Filtered List"

        // ... (keeping original stats logic roughly same but using period-filtered logs)
        const now = new Date();
        let cutoff = new Date();
        if (period === '24h') cutoff.setDate(now.getDate() - 1);
        else if (period === '7d') cutoff.setDate(now.getDate() - 7);
        else if (period === '30d') cutoff.setDate(now.getDate() - 30);

        const periodLogs = allLogs.filter(l => new Date(l.fechaRealizacion) >= cutoff);

        const totalMods = periodLogs.length;
        const uniqueUsers = new Set(periodLogs.map(l => l.usuarioNombre || 'Sistema'));
        // ... (token decoding logic same as before)
        let uniqueAccessCount = uniqueUsers.size; // Simplified for now

        // Re-add token logic if needed for accuracy, or keep simple
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);
                if (decoded.name) uniqueUsers.add(decoded.name);
                else if (decoded.sub) uniqueUsers.add(decoded.sub);
            }
        } catch (e) { }
        uniqueAccessCount = uniqueUsers.size;

        setStats({
            accesos: uniqueAccessCount,
            modificaciones: totalMods,
            alertas: Math.floor(Math.random() * 2), // Reduced mock noise
            cierres: Math.floor(Math.random() * 3)
        });
    };

    // Get unique users for dropdown
    const uniqueUserNames = Array.from(new Set(allLogs.map(l => l.usuarioNombre || 'Sistema')));

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return {
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: d.toLocaleDateString([], { month: '2-digit', day: '2-digit' })
        };
    };

    const chartData = [5, 12, 8, 15, 20, 10, stats.modificaciones > 20 ? 20 : stats.modificaciones];

    return (
        <>
            {/* HEADER */}
            <div className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className={styles.title}>Auditoría</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Registro de seguridad y trazabilidad del sistema</p>
                    </div>
                    {/* Period Selector */}
                    <div>
                        <select
                            className={styles.select}
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            style={{ width: '200px', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                        >
                            <option value="24h">Últimas 24 Horas</option>
                            <option value="7d">Últimos 7 Días</option>
                            <option value="30d">Últimos 30 Días</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* KPI CARDS */}
            <section className={styles.statsGrid}>
                {/* Accesos */}
                <div className={`${styles.statCard} ${styles.cardBlue}`}>
                    <div>
                        <span className={styles.statLabel}>Accesos Únicos</span>
                        <div className={styles.statValue}>{stats.accesos}</div>
                        <div className={styles.statSub}>Usuarios activos en el periodo</div>
                    </div>
                </div>

                {/* Modificaciones */}
                <div className={`${styles.statCard} ${styles.cardGreen}`}>
                    <div>
                        <span className={styles.statLabel}>Modificaciones</span>
                        <div className={styles.statValue}>{stats.modificaciones}</div>
                        <div className={styles.statSub}>Registros guardados</div>
                    </div>
                </div>

                {/* Alertas */}
                <div className={`${styles.statCard} ${styles.cardYellow}`}>
                    <div>
                        <span className={styles.statLabel}>Alertas</span>
                        <div className={styles.statValue}>{stats.alertas}</div>
                        <div className={styles.statSub}>Intentos fallidos</div>
                    </div>
                </div>

                {/* Cierres */}
                <div className={`${styles.statCard} ${styles.cardRed}`}>
                    <div>
                        <span className={styles.statLabel}>Cierres de Sesión</span>
                        <div className={styles.statValue}>{stats.cierres}</div>
                        <div className={styles.statSub}>Manuales</div>
                    </div>
                </div>
            </section>

            {/* CONTENT SPLIT */}
            <div className={styles.contentGrid}>

                {/* LISTA DE ACTIVIDAD (Filtered) */}
                <div className={styles.timelineCard}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Registro de Actividad Reciente</h3>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {/* Paginación simple visual */}
                        </div>
                    </div>

                    <div className={styles.eventList}>
                        {loading ? (
                            <p style={{ color: 'var(--text-muted)' }}>Cargando auditoría...</p>
                        ) : filteredLogs.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No hay actividad con los filtros seleccionados.</p>
                        ) : (
                            filteredLogs.slice(0, 8).map((log) => { // Mostrar solo 8
                                const f = formatDate(log.fechaRealizacion);
                                return (
                                    <div key={log.idRegistro} className={styles.eventItem}>
                                        <div className={styles.eventIcon}>
                                            <FaEdit />
                                        </div>
                                        <div className={styles.eventBody}>
                                            <div className={styles.eventTitle}>ACTUALIZAR en Respuesta</div>
                                            <div className={styles.eventDesc}>
                                                Se guardó respuesta para el paciente <strong style={{ color: 'var(--text-main)' }}>{log.nombrePaciente}</strong>.
                                                <br />
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Usuario: {log.usuarioNombre || 'Sistema'}</span>
                                            </div>
                                        </div>
                                        <div className={styles.eventTime}>
                                            <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{f.time}</div>
                                            <div style={{ color: 'var(--text-muted)' }}>{f.date}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* FILTROS Y CHART */}
                <div>
                    <div className={styles.filterCard}>
                        <h3 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>Filtros Avanzados</h3>

                        <div className={styles.filterGroup}>
                            <label className={styles.label}>Buscar Paciente</label>
                            <input
                                type="text"
                                placeholder="Nombre del paciente..."
                                className={styles.select} // Reusing select style for consistency
                                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.label}>Usuario</label>
                            <select
                                className={styles.select}
                                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                            >
                                <option value="all">Todos los usuarios</option>
                                {uniqueUserNames.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.label}>Tipo de Evento</label>
                            <select
                                className={styles.select}
                                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }}
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <option value="all">Todos los eventos</option>
                                <option value="RESPUESTA">Respuesta Guardada</option>
                                <option value="ACCESO">Inicio de Sesión</option>
                                <option value="ALERTA">Alerta de Seguridad</option>
                                <option value="CIERRE">Cierre de Sesión</option>
                            </select>
                        </div>

                        <button
                            className={styles.searchBtn}
                            onClick={() => applyFilters()}
                        >
                            <FaSearch /> Aplicar Filtros
                        </button>

                        {/* CHART SIMPLE */}
                        <div className={styles.chartContainer}>
                            <div className={styles.chartTitle}>Actividad Semanal</div>
                            <div className={styles.barChart}>
                                {chartData.map((val, idx) => (
                                    <div key={idx} className={styles.barCol}>
                                        <div className={styles.bar} style={{ height: `${Math.min(val * 4, 100)}%` }}></div>
                                        <div className={styles.barLabel}>D{idx + 1}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}