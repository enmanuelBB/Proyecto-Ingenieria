import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState('light');

  // 1. Cargar preferencia guardada al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    // Opcional: Detectar preferencia del sistema si no hay guardado
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    }
  }, []);

  // 2. Aplicar el tema al documento cuando cambie el estado
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}