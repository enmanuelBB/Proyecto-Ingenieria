"use client";

import React from 'react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useTheme(); 

  return <>{children}</>;
}