// Ubicación: components/DynamicHeroText.tsx
"use client";

import React, { useState, useEffect } from 'react';
import styles from '../page.module.css'; 

const FEATURES = [
  "Registro Centralizado y Estandarizado.",
  "Reducción de Errores de Tipeo.",
  "Análisis de Datos en Tiempo Real.",
  "Optimizado para Exportación a STATA."
];

export default function DynamicHeroText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % FEATURES.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  return (
    <p className={styles.dynamicText}>
      <span key={index} className={styles.dynamicTextInner}>
        {FEATURES[index]}
      </span>
    </p>
  );
}