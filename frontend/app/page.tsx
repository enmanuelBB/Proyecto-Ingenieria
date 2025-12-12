// Ubicación: app/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { FaDatabase, FaShieldAlt, FaChartBar } from 'react-icons/fa';
import Swal from 'sweetalert2';

import DynamicHeroText from './components/DynamicHeroText';
import LoginPanel from './components/LoginPanel';

export default function LoginPage() {

  const handleExplore = () => {
    Swal.fire({
      title: 'Funcionalidades del Sistema',
      html: `
        <div style="text-align: left; padding: 0 10px;">
            <div style="margin-bottom: 20px;">
                <h3 style="color: #4f46e5; font-size: 1.1em; display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                    📊 Dashboard Interactivo
                </h3>
                <p style="font-size: 0.95em; color: #475569; margin: 0; line-height: 1.5;">
                    Visualiza estadísticas en tiempo real, métricas clave y el estado general del estudio clínico.
                </p>
            </div>
            <div style="margin-bottom: 20px;">
                <h3 style="color: #4f46e5; font-size: 1.1em; display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                    👥 Gestión de Pacientes
                </h3>
                <p style="font-size: 0.95em; color: #475569; margin: 0; line-height: 1.5;">
                    Registro completo de fichas clínicas, seguimiento longitudinal y control de datos demográficos.
                </p>
            </div>
            <div style="margin-bottom: 20px;">
                <h3 style="color: #4f46e5; font-size: 1.1em; display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                    📋 Encuestas Dinámicas
                </h3>
                <p style="font-size: 0.95em; color: #475569; margin: 0; line-height: 1.5;">
                    Crea, edita y responde formularios clínicos personalizados para el estudio de Cáncer Gástrico.
                </p>
            </div>
            <div>
                <h3 style="color: #4f46e5; font-size: 1.1em; display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                    🛡️ Auditoría y Seguridad
                </h3>
                <p style="font-size: 0.95em; color: #475569; margin: 0; line-height: 1.5;">
                    Sistema robusto de roles, autenticación segura y trazabilidad completa de acciones.
                </p>
            </div>
        </div>
      `,
      width: '600px',
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#4f46e5',
      customClass: {
        popup: 'animated fadeInDown'
      }
    });
  };

  return (
    <main className={styles.mainContainer}>

      {/* Barra de Navegación Superior */}
      <nav className={styles.topNav}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo-vital3.png"
            alt="Logo Ingeniería Vital"
            width={35}
            height={35}
          />
          Ingeniería Vital <span className={styles.logoDot}>•</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/about" className={styles.navLink}>Acerca del Estudio</Link>
          <Link href="/contact" className={styles.navLink}>Contacto</Link>
          <Link href="/" className={styles.navLink}>Acceso</Link>
        </div>
      </nav>

      {/* Hero Section Principal */}
      <section className={styles.heroSection}>

        {/* --- COLUMNA IZQUIERDA --- */}
        <div className={`${styles.heroText} ${styles.fadeInUp}`}>
          <h1>Sistema Central de <br />Registro de Pacientes</h1>

          {/* Texto que cambia solo */}
          <DynamicHeroText />

          {/* Botón Principal */}
          {/* Botón Principal - Modificado para abrir Modal */}
          <button onClick={handleExplore} className={styles.mainCta} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
            Explorar Funciones
          </button>



        </div>

        {/* --- COLUMNA DERECHA --- */}
        <div className={`${styles.loginPanel} ${styles.fadeInRight}`}>
          <LoginPanel />
        </div>

      </section>

    </main>
  );
}