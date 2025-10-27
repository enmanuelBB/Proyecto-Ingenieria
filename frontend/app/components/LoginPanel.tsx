// Ubicación: components/LoginPanel.tsx
"use client";

import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import styles from '../page.module.css';

// Componente para simular la carga (Skeleton)
const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonLine} style={{ width: '80%', height: '20px' }}></div>
    <div className={styles.skeletonLine} style={{ width: '100%', height: '40px' }}></div>
    <div className={styles.skeletonLine} style={{ width: '100%', height: '40px' }}></div>
    <div className={styles.skeletonLine} style={{ width: '100%', height: '40px', marginTop: '2rem' }}></div>
  </div>
);

export default function LoginPanel() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500); 
    return () => clearTimeout(timer); 
  }, []);

  return (
    <>
      <div className={styles.loginHeader}>
        <h3>Acceso a la Plataforma</h3>
        <p>Ingrese sus credenciales institucionales.</p>
      </div>
      
      {isLoaded ? (
        <LoginForm />
      ) : (
        <SkeletonCard />
      )}
    </>
  );
}