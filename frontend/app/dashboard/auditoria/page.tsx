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

    useEffect(() => {
        calculateStats();
    }, [allLogs, period]);

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

    const calculateStats = () => {
        const now = new Date();
        let cutoff = new Date();
        let daysMultiplier = 1;

        if (period === '24h') {
            cutoff.setDate(now.getDate() - 1);
            daysMultiplier = 1;
        } else if (period === '7d') {
            cutoff.setDate(now.getDate() - 7);
            daysMultiplier = 7;
        } else if (period === '30d') {
            cutoff.setDate(now.getDate() - 30);
            daysMultiplier = 30;
        }

        const periodLogs = allLogs.filter(l => new Date(l.fechaRealizacion) >= cutoff);
        setFilteredLogs(periodLogs);

        const totalMods = periodLogs.length;
        const uniqueUsers = new Set(periodLogs.map(l => l.usuarioNombre || 'Sistema'));

        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);
                if (decoded.name) {
                    uniqueUsers.add(decoded.name);
                } else if (decoded.sub) {
                    uniqueUsers.add(decoded.sub); 
                }
            }
        } catch (e) {
            console.error("Error decoding token for stats", e);
        }

        let uniqueAccessCount = uniqueUsers.size;
        const alertasMock = Math.floor(Math.random() * 1 * daysMultiplier);
        const cierresMock = Math.floor(Math.random() * 2 * daysMultiplier);

        setStats({
            accesos: uniqueAccessCount,
            modificaciones: totalMods,
            alertas: alertasMock,
            cierres: cierresMock
        });
    };

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
                            <p style={{color: 'var(--text-muted)'}}>Cargando auditoría...</p>
                        ) : filteredLogs.length === 0 ? (
                            <p style={{color: 'var(--text-muted)'}}>No hay actividad registrada en este periodo.</p>
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
                                                Se guardó respuesta para el paciente <strong style={{color: 'var(--text-main)'}}>{log.nombrePaciente}</strong>.
                                                <br />
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Usuario: {log.usuarioNombre || 'Sistema'}</span>
                                            </div>
                                        </div>
                                        <div className={styles.eventTime}>
                                            <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{f.time}</div>
                                            <div style={{color: 'var(--text-muted)'}}>{f.date}</div>
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
                            <label className={styles.label}>Usuario</label>
                            <select className={styles.select} style={{backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)'}}>
                                <option>Todos los usuarios</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.label}>Tipo de Evento</label>
                            <select className={styles.select} style={{backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', borderColor: 'var(--border-color)'}}>
                                <option>Todos los eventos</option>
                            </select>
                        </div>

                        <button className={styles.searchBtn}>
                            <FaSearch /> Buscar Eventos
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