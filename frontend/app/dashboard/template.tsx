
"use client";

import React from 'react';

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Aplicamos la clase de animación definida en globals.css
    <div className="animate-enter">
      {children}
    </div>
  );
}