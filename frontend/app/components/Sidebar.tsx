"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Importante para navegar
import { usePathname, useRouter } from 'next/navigation';
import styles from '../dashboard/dashboard.module.css';
import { FaClipboardList, FaUserInjured, FaSearch, FaFileExport, FaSignOutAlt, FaShieldAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useSidebar } from '../context/SidebarContext';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();
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
                const defaultSurvey = encuestas.find((e: any) => e.titulo.includes("Estudio Cáncer Gástrico"));
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
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
            <div className={styles.sidebarHeader}>
                <Image src="/logo-vital3.png" alt="Logo" width={30} height={30} style={{ minWidth: '30px' }} />
                <span className={styles.sidebarTitle}>Ingeniería Vital</span>
                <button onClick={toggleSidebar} className={styles.toggleButton} title={isCollapsed ? "Expandir" : "Colapsar"}>
                    {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
                </button>
            </div>

            <nav className={styles.nav}>
                {/* Enlace al Dashboard */}
                <Link
                    href="/dashboard"
                    className={`${styles.navItem} ${pathname === '/dashboard' ? styles.navItemActive : ''}`}
                    title={isCollapsed ? "Dashboard" : ""}
                >
                    <FaClipboardList size={20} style={{ minWidth: '20px' }} />
                    {!isCollapsed && <span className={styles.linkText}>Dashboard</span>}
                </Link>

                {/* Enlace a Pacientes */}
                <Link
                    href="/dashboard/pacientes"
                    className={`${styles.navItem} ${pathname.startsWith('/dashboard/pacientes') ? styles.navItemActive : ''}`}
                    title={isCollapsed ? "Pacientes" : ""}
                >
                    <FaUserInjured size={20} style={{ minWidth: '20px' }} />
                    {!isCollapsed && <span className={styles.linkText}>Pacientes</span>}
                </Link>

                {/* Enlace a Encuestas (Dinámico) */}
                <div
                    className={`${styles.navItem} ${pathname.startsWith('/dashboard/encuesta') ? styles.navItemActive : ''}`}
                    onClick={() => defaultSurveyId && router.push(`/dashboard/encuesta/${defaultSurveyId}`)}
                    style={{ cursor: defaultSurveyId ? 'pointer' : 'wait', opacity: defaultSurveyId ? 1 : 0.7 }}
                    title={isCollapsed ? "Encuestas" : ""}
                >
                    <FaSearch size={20} style={{ minWidth: '20px' }} />
                    {!isCollapsed && <span className={styles.linkText}>Encuestas</span>}
                </div>

                <Link
                    href="/dashboard/exportar-datos"
                    className={`${styles.navItem} ${pathname === '/dashboard/exportar-datos' ? styles.navItemActive : ''}`}
                    title={isCollapsed ? "Exportar Datos" : ""}
                >
                    <FaFileExport size={20} style={{ minWidth: '20px' }} />
                    {!isCollapsed && <span className={styles.linkText}>Exportar Datos</span>}
                </Link>

                <Link
                    href="/dashboard/auditoria"
                    className={`${styles.navItem} ${pathname === '/dashboard/auditoria' ? styles.navItemActive : ''}`}
                    title={isCollapsed ? "Auditoría" : ""}
                >
                    <FaShieldAlt size={20} style={{ minWidth: '20px' }} />
                    {!isCollapsed && <span className={styles.linkText}>Auditoría</span>}
                </Link>
            </nav>

            <button onClick={handleLogout} className={styles.logoutButton} title={isCollapsed ? "Cerrar Sesión" : ""}>
                <FaSignOutAlt size={20} style={{ minWidth: '20px' }} />
                {!isCollapsed && <span className={styles.linkText}>Cerrar Sesión</span>}
            </button>
        </aside>
    );
}