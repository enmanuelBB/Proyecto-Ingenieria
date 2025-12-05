// /app/export-data/page.tsx

import React from 'react';
// ¡Reemplaza la importación con la ruta relativa!
import ExportDataView from '../components/ExportDataView';

export default function ExportDataPage() {
    return (
        <div className="p-8">
            <h1>Exportar Datos</h1>
            <p>Seleccione el formato para descargar los datos de las encuestas.</p>
            <ExportDataView />
        </div>
    );
}