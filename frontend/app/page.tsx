"use client";

import React from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import DynamicHeroText from './components/DynamicHeroText';
import LoginPanel from './components/LoginPanel';
import ThemeToggle from './components/ThemeToggle'; // Importamos el botón

export default function LoginPage() {

  return (
    <main 
      className={styles.mainContainer} 
      // Forzamos el uso de la variable global de fondo para que el modo oscuro funcione
      style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', position: 'relative' }} 
    >

      {/* --- BOTÓN MODO OSCURO (Esquina Superior Derecha) --- */}
      <div style={{ position: 'absolute', top: '20px', right: '30px', zIndex: 100 }}>
        <ThemeToggle />
      </div>

      {/* Hero Section Principal (Mantenemos tu diseño dividido) */}
      <section className={styles.heroSection}>

        {/* --- COLUMNA IZQUIERDA --- */}
        <div className={`${styles.heroText} ${styles.fadeInUp}`}>
          
          {/* Logo Pequeño  */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
             <Image
                src="/logo-vital3.png"
                alt="Logo Ingeniería Vital"
                width={40}
                height={40}
              />
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                Ingeniería Vital
              </span>
          </div>

          <h1 style={{ color: 'var(--text-main)' }}>
            Sistema Central de <br />Registro de Pacientes
          </h1>

          {/* Texto que cambia solo */}
          <div style={{ color: 'var(--text-muted)' }}>
            <DynamicHeroText />
          </div>

    

        </div>

        {/* --- COLUMNA DERECHA --- */}
        <div className={`${styles.loginPanel} ${styles.fadeInRight}`}>
          <LoginPanel />
        </div>

      </section>

    </main>
  );
}