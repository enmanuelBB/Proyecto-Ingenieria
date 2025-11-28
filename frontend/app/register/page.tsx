"use client";

import React from 'react';
import Image from 'next/image';
import styles from '../page.module.css'; 
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  return (
    <main className={styles.mainContainer}>
        
      <div className={styles.loginPanel} style={{margin: 'auto', marginTop: '50px'}}>
          <div className={styles.loginHeader}>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                <Image
                    src="/logo-vital2.png"
                    alt="Logo Ingeniería Vital"
                    width={50} 
                    height={50}
                />
            </div>
            <h3>Crear Nueva Cuenta</h3>
            <p>Únete a la plataforma</p>
          </div>
          
          <RegisterForm />
      </div>
      
    </main>
  );
}