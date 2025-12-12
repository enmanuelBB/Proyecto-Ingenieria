"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { FaUserPlus, FaClipboardList, FaUserInjured, FaEdit, FaPlus } from 'react-icons/fa';

interface Paciente {
  idPaciente: number;
  rut: string;
  nombre: string;
  apellidos: string;
  sexo: string;
  fechaNacimiento: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>("Usuario");
  const [role, setRole] = useState<string | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPacientes: 0, totalEncuestas: 0, registrosHoy: 0 });
  const [defaultSurveyId, setDefaultSurveyId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/');
      return;
    }

    // Decodificar Token para obtener nombre y rol
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);
      if (decoded.name) {
        setUser(decoded.name);
      }
      if (decoded.authorities && Array.isArray(decoded.authorities)) {
        // Asumiendo que authorities es [{authority: "ROLE_ADMIN"}, ...] o similar
        // Si es simple string o array de strings, ajustar.
        // Backend suele mandar: [{authority: 'ADMIN'}] o strings directos.
        // Vamos a mostrar el primer rol encontrado si es lista compleja.
        const r = decoded.authorities[0]?.authority || decoded.authorities[0] || "";
        setRole(r.replace("ROLE_", ""));
      }
    } catch (e) {
      console.error("Error decodificando token", e);
    }

    const fetchData = async () => {
      try {
        // 1. Petición a Pacientes (se mantiene igual)
        const resPacientes = await fetch('http://localhost:8080/api/v1/pacientes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        let totalPacientesLen = 0;
        if (resPacientes.ok) {
          const dataPacientes: Paciente[] = await resPacientes.json();
          setPacientes(dataPacientes.slice(-5).reverse());
          totalPacientesLen = dataPacientes.length;
        }

        // 2. Petición a Encuestas (para obtener la default) y luego sus registros
        const resEncuestas = await fetch('http://localhost:8080/api/v1/encuestas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        let surveyIdToUse: number | null = null;

        if (resEncuestas.ok) {
          const encuestas: any[] = await resEncuestas.json();
          const defaultSurvey = encuestas.find((e: any) => e.titulo.includes("Estudio Cáncer Gástrico"));

          if (defaultSurvey) {
            surveyIdToUse = defaultSurvey.idEncuesta;
            setDefaultSurveyId(surveyIdToUse);
          } else if (encuestas.length > 0) {
            surveyIdToUse = encuestas[0].idEncuesta;
            setDefaultSurveyId(surveyIdToUse);
          }
        }

        // 3. Obtener Estadísticas Reales si tenemos una encuesta ID
        let totalEncuestasLen = 0;
        let registrosHoyLen = 0;

        if (surveyIdToUse) {
          const resRegistros = await fetch(`http://localhost:8080/api/v1/encuestas/${surveyIdToUse}/registros`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (resRegistros.ok) {
            const registros: any[] = await resRegistros.json();
            totalEncuestasLen = registros.length;

            // Calcular registros de HOY
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            registrosHoyLen = registros.filter((r: any) => r.fechaRealizacion.startsWith(today)).length;
          }
        }

        // Actualizar estado final
        setStats({
          totalPacientes: totalPacientesLen,
          totalEncuestas: totalEncuestasLen,
          registrosHoy: registrosHoyLen
        });

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);



  return (
    <>
      {/* Header Superior */}
      <header className={styles.header}>
        <div className={styles.welcomeText}>
          <h1>Hola, {user} {role && <span style={{ fontSize: '0.6em', color: '#666', opacity: 0.8, verticalAlign: 'middle', border: '1px solid #ccc', borderRadius: '4px', padding: '2px 6px' }}> {role}</span>} 👋</h1>
          <p>Aquí tienes un resumen de la actividad del estudio.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Aquí podrías poner un avatar o notificaciones */}
        </div>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.iconBlue}`}>
            <FaUserInjured />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Pacientes</h3>
            <p>{loading ? "..." : stats.totalPacientes}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.iconPurple}`}>
            <FaClipboardList />
          </div>
          <div className={styles.statInfo}>
            <h3>Encuestas Completas</h3>
            <p>{loading ? "..." : stats.totalEncuestas}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIconBox} ${styles.iconGreen}`}>
            <FaPlus />
          </div>
          <div className={styles.statInfo}>
            <h3>Registros Hoy</h3>
            <p>{loading ? "..." : (stats as any).registrosHoy || 0}</p>
          </div>
        </div>
      </section>

      <section className={styles.sectionGrid}>

        {/* Tabla de Pacientes Recientes */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Pacientes Recientes</h3>
            <button style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => router.push('/dashboard/pacientes')}>Ver todos</button>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3}>Cargando datos...</td></tr>
              ) : pacientes.length > 0 ? (
                pacientes.map((p) => (
                  <tr key={p.idPaciente}>
                    <td style={{ fontWeight: '500' }}>{p.nombre} {p.apellidos}</td>
                    <td>{p.rut}</td>
                    <td>
                      <button
                        style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => router.push(`/dashboard/pacientes/${p.idPaciente}`)}
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>No hay registros recientes.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Gestión Rápida</h3>
            </div>

            <button className={styles.actionButton} onClick={() => router.push('/dashboard/pacientes/nuevo')}>
              <FaUserPlus size={20} color="#4f46e5" />
              <div>
                <div style={{ textAlign: 'left' }}>Registrar Paciente</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>Crear nueva ficha clínica</div>
              </div>
            </button>

            <button className={styles.actionButton} onClick={() => defaultSurveyId && router.push(`/dashboard/encuesta/${defaultSurveyId}`)}>
              <FaClipboardList size={20} color="#4f46e5" />
              <div>
                <div style={{ textAlign: 'left' }}>Responder Encuesta</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>Ingresar datos de formulario</div>
              </div>
            </button>

            {/* Botón añadido: Personalizar Formulario */}
            <button className={styles.actionButton} onClick={() => defaultSurveyId && router.push(`/dashboard/constructor/${defaultSurveyId}`)}>
              <FaEdit size={20} color="#8b5cf6" />
              <div>
                <div style={{ textAlign: 'left' }}>Personalizar Formulario</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>Editar variables y preguntas</div>
              </div>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}