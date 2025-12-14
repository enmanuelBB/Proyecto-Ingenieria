"use client";

import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-main)',
        padding: '10px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        width: '40px',
        height: '40px'
      }}
      title="Cambiar Modo Oscuro/Claro"
    >
      {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} color="#fbbf24" />}
    </button>
  );
}