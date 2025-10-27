// Ubicación: app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';


import DynamicHeroText from './components/DynamicHeroText';
import LoginPanel from './components/LoginPanel';


// Componente para simular la carga (Skeleton)
const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonLine} style={{ width: '80%', height: '20px' }}></div>
    <div className={styles.skeletonLine} style={{ width: '100%', height: '40px' }}></div>
    <div className={styles.skeletonLine} style={{ width: '100%', height: '40px' }}></div>
    <div className={styles.skeletonLine} style={{ width: '100%', height: '40px', marginTop: '2rem' }}></div>
  </div>
);


export default function LoginPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simula la carga de datos (1.5 segundos)
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500); 
    return () => clearTimeout(timer); 
  }, []);

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
        
        {/* Lado Izquierdo: Mensaje */}
        <div className={`${styles.heroText} ${styles.fadeInUp}`}>
          <h1>Sistema Central de <br/>Registro de Pacientes</h1>
          
          <DynamicHeroText /> 
          
          <Link href="/features" className={styles.mainCta}>Explorar Funciones</Link>
          
   
        </div>

        {/* Lado Derecho: Formulario o Skeleton */}
        <div className={`${styles.loginPanel} ${styles.fadeInRight}`}>
          <LoginPanel />
        </div>

      </section>
      
 
      
    </main>
  );
}