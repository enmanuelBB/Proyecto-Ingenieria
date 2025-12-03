"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Importante para navegar
import { usePathname, useRouter } from 'next/navigation';
import styles from '../dashboard/dashboard.module.css'; 
import { FaClipboardList, FaUserInjured, FaSearch, FaFileExport, FaSignOutAlt } from 'react-icons/fa';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname(); // Para saber en qué página estamos y marcarla activa

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('deviceId');
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

        {/* Enlace a Pacientes (NUEVO) */}
        <Link 
          href="/dashboard/pacientes" 
          className={`${styles.navItem} ${pathname === '/dashboard/pacientes' ? styles.navItemActive : ''}`}
        >
          <FaUserInjured /> Pacientes
        </Link>

        <div className={styles.navItem}>
          <FaSearch /> Encuestas
        </div>
        <div className={styles.navItem}>
          <FaFileExport /> Exportar Datos
        </div>
      </nav>

      <button onClick={handleLogout} className={styles.logoutButton}>
        <FaSignOutAlt /> Cerrar Sesión
      </button>
    </aside>
  );
}