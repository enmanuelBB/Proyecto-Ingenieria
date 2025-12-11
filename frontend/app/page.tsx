// Ubicación: app/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { FaDatabase, FaShieldAlt, FaChartBar } from 'react-icons/fa'; 

import DynamicHeroText from './components/DynamicHeroText';
import LoginPanel from './components/LoginPanel';

export default function LoginPage() {

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
          <h1>Sistema Central de <br/>Registro de Pacientes</h1>
          
          {/* Texto que cambia solo */}
          <DynamicHeroText /> 
          
          {/* Botón Principal */}
          <Link href="/features" className={styles.mainCta}>Explorar Funciones</Link>
          
  

        </div>

        {/* --- COLUMNA DERECHA --- */}
        <div className={`${styles.loginPanel} ${styles.fadeInRight}`}>
          <LoginPanel />
        </div>

      </section>
      
    </main>
  );
}