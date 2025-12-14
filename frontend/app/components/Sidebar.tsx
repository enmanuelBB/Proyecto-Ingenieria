"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { usePathname, useRouter } from 'next/navigation';
import styles from '../dashboard/dashboard.module.css';
import { FaClipboardList, FaUserInjured, FaSearch, FaFileExport, FaSignOutAlt, FaShieldAlt, FaChevronLeft, FaChevronRight, FaUsers, FaMoon, FaSun } from 'react-icons/fa';
import { useSidebar } from '../context/SidebarContext';
import Swal from 'sweetalert2';
import { useTheme } from '../hooks/useTheme';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();
    const [defaultSurveyId, setDefaultSurveyId] = React.useState<number | null>(null);
    const [role, setRole] = React.useState<string | null>(null);
    
    const { theme, toggleTheme } = useTheme();

    React.useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                let userRole = payload.role;
                if (!userRole && payload.authorities && Array.isArray(payload.authorities)) {
                    const firstAuthority = payload.authorities[0];
                    userRole = firstAuthority?.authority || firstAuthority;
                }
                setRole(userRole || null);
            } catch (e) {
                console.error("Error decoding token for role:", e);
            }
        }
        if (!token) return;

        fetch('http://localhost:8080/api/v1/encuestas', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : [])
            .then((encuestas: any[]) => {
                const defaultSurvey = encuestas.find((e: any) => e.titulo.includes("Estudio Cáncer Gástrico"));
                if (defaultSurvey) {
                    setDefaultSurveyId(defaultSurvey.idEncuesta);
                } else if (encuestas.length > 0) {
                    setDefaultSurveyId(encuestas[0].idEncuesta);
                }
            })
            .catch(err => console.error("Error fetching surveys associated to Sidebar:", err));
    }, []);

    const handleLogout = async () => {
        await Swal.fire({
            title: 'Cerrando sesión...',
            text: 'Has cerrado sesión exitosamente.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        router.push('/');
    };

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
            
            {/* 1. HEADER (Logo + Título) */}
            <div className={styles.sidebarHeader}>
                <Image src="/logo-vital3.png" alt="Logo" width={30} height={30} style={{ minWidth: '30px' }} />
                <span className={styles.sidebarTitle}>Ingeniería Vital</span>
                <button onClick={toggleSidebar} className={styles.toggleButton} title={isCollapsed ? "Expandir" : "Colapsar"}>
                    {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
                </button>
            </div>

            {/* 2. BODY (Navegación con Scroll) */}
            <nav className={styles.nav}>
                <Link
                    href="/dashboard"
                    className={`${styles.navItem} ${pathname === '/dashboard' ? styles.navItemActive : ''}`}
                    title={isCollapsed ? "Dashboard" : ""}
                >
                    <FaClipboardList size={20} style={{ minWidth: '20px' }} />
                    {!isCollapsed && <span className={styles.linkText}>Dashboard</span>}
                </Link>

                <Link
                    href="/dashboard/pacientes"
                    className={`${styles.navItem} ${pathname.startsWith('/dashboard/pacientes') ? styles.navItemActive : ''}`}
                    title={isCollapsed ? "Pacientes" : ""}
                >
                    <FaUserInjured size={20} style={{ minWidth: '20px' }} />
                    {!isCollapsed && <span className={styles.linkText}>Pacientes</span>}
                </Link>

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

                {(role === 'ADMIN' || role === 'ROLE_ADMIN') && (
                    <Link
                        href="/dashboard/usuarios"
                        className={`${styles.navItem} ${pathname === '/dashboard/usuarios' ? styles.navItemActive : ''}`}
                        title={isCollapsed ? "Gestionar Roles" : ""}
                    >
                        <FaUsers size={20} style={{ minWidth: '20px' }} />
                        {!isCollapsed && <span className={styles.linkText}>Gestionar Roles</span>}
                    </Link>
                )}
            </nav>

            {/* 3. FOOTER (Modo Oscuro + Logout) */}
            <div className={styles.sidebarFooter}>
                <button 
                    onClick={toggleTheme} 
                    className={styles.navItem} 
                    title={isCollapsed ? (theme === 'light' ? "Modo Oscuro" : "Modo Claro") : ""}
                    style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', background: 'transparent', border: 'none', width: '100%' }}
                >
                    {theme === 'light' ? (
                        <FaMoon size={20} style={{ minWidth: '20px' }} />
                    ) : (
                        <FaSun size={20} style={{ minWidth: '20px' }} />
                    )}
                    {!isCollapsed && <span className={styles.linkText}>{theme === 'light' ? "Modo Oscuro" : "Modo Claro"}</span>}
                </button>

                <button onClick={handleLogout} className={styles.logoutButton} title={isCollapsed ? "Cerrar Sesión" : ""}>
                    <FaSignOutAlt size={20} style={{ minWidth: '20px' }} />
                    {!isCollapsed && <span className={styles.linkText}>Cerrar Sesión</span>}
                </button>
            </div>
        </aside>
    );
}