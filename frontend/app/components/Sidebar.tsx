"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Importante para navegar
import { usePathname, useRouter } from 'next/navigation';
import styles from '../dashboard/dashboard.module.css';
import { FaClipboardList, FaUserInjured, FaSearch, FaFileExport, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [defaultSurveyId, setDefaultSurveyId] = React.useState<number | null>(null);

    React.useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        fetch('http://localhost:8080/api/v1/encuestas', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : [])
            .then((encuestas: any[]) => {
                // Logic to find the default survey (same as Dashboard)
                const defaultSurvey = encuestas.find(e => e.titulo.includes("Estudio Cáncer Gástrico"));
                if (defaultSurvey) {
                    setDefaultSurveyId(defaultSurvey.idEncuesta);
                } else if (encuestas.length > 0) {
                    setDefaultSurveyId(encuestas[0].idEncuesta);
                }
            })
            .catch(err => console.error("Error fetching surveys associated to Sidebar:", err));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        router.push('/');
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <Image src="/logo-vital3.png" alt="Logo" width={30} height={30} />
                <span className={styles.sidebarTitle}>Ingeniería Vital</span>
            </div>

            <nav className={styles.nav}>
                {/* Enlace al Dashboard */}
                <Link
                    href="/dashboard"
                    className={`${styles.navItem} ${pathname === '/dashboard' ? styles.navItemActive : ''}`}
                >
                    <FaClipboardList /> Dashboard
                </Link>

                {/* Enlace a Pacientes */}
                <Link
                    href="/dashboard/pacientes"
                    className={`${styles.navItem} ${pathname === '/dashboard/pacientes' ? styles.navItemActive : ''}`}
                >
                    <FaUserInjured /> Pacientes
                </Link>

                {/* Enlace a Encuestas (Dinámico) */}
                <div
                    className={`${styles.navItem} ${pathname.startsWith('/encuesta') ? styles.navItemActive : ''}`}
                    onClick={() => defaultSurveyId && router.push(`/encuesta/${defaultSurveyId}`)}
                    style={{ cursor: defaultSurveyId ? 'pointer' : 'wait', opacity: defaultSurveyId ? 1 : 0.7 }}
                >
                    <FaSearch /> Encuestas
                </div>

                <Link
                    href="/exportar-datos"
                    className={`${styles.navItem} ${pathname === '/exportar-datos' ? styles.navItemActive : ''}`}
                >
                    <FaFileExport /> Exportar Datos
                </Link>

                <Link
                    href="/dashboard/auditoria"
                    className={`${styles.navItem} ${pathname === '/dashboard/auditoria' ? styles.navItemActive : ''}`}
                >
                    <FaShieldAlt /> Auditoría
                </Link>
            </nav>

            <button onClick={handleLogout} className={styles.logoutButton}>
                <FaSignOutAlt /> Cerrar Sesión
            </button>
        </aside>
    );
}