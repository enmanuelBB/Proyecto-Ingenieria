
"use client";

import React, { useState, useEffect } from 'react';
import { FaFileExcel, FaFileCsv, FaFilePdf, FaDownload, FaUser, FaUsers, FaCog, FaExclamationCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import styles from './ExportDataView.module.css';

interface Paciente {
  idPaciente: number;
  rut: string;
  nombre: string;
  apellidos: string;
}

const ExportDataView = () => {
  // Estado para el ID de encuesta (por defecto 1, pero editable)
  const [surveyId, setSurveyId] = useState<string>('1');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Opciones Avanzadas
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

  // Estados de Filtro
  const [exportMode, setExportMode] = useState<'all' | 'patient'>('all');
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [loadingPatients, setLoadingPatients] = useState<boolean>(false);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const res = await fetch(`${baseUrl}/api/v1/pacientes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        }
      } catch (err) {
        console.error("Error fetching patients", err);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    setError(null);

    if (!surveyId) {
      setError('⚠️ Por favor ingrese un ID de encuesta válido en opciones avanzadas.');
      return;
    }

    if (exportMode === 'patient' && !selectedPatientId) {
      setError('⚠️ Por favor seleccione un paciente para exportar.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('🔒 Sesión expirada. Inicie sesión nuevamente.');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      // Construir URL con el ID de encuesta ingresado
      let url = `${baseUrl}/api/v1/encuestas/${surveyId}/export/${format}`;

      // Agregar parámetro de paciente si es necesario
      if (exportMode === 'patient' && selectedPatientId) {
        url += `?idPaciente=${selectedPatientId}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error(`No se encontraron datos para la encuesta ID ${surveyId}.`);
        throw new Error(`Error ${response.status}: Fallo al exportar.`);
      }

      // Descargar archivo
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const extension = format === 'excel' ? 'xlsx' : format;
      const suffix = exportMode === 'patient' ? `_paciente_${selectedPatientId}` : '_completo';
      a.download = `reporte_encuesta_${surveyId}${suffix}.${extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      Swal.fire({
        icon: 'success',
        title: '¡Exportación Exitosa!',
        text: 'El archivo se ha descargado correctamente en tu dispositivo.',
        confirmButtonColor: '#3085d6',
      });

    } catch (error: any) {
      console.error('Export error:', error);
      setError(error.message || '🚫 Error desconocido al exportar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          <FaDownload color="#4f46e5" /> Centro de Exportación
        </h1>
        <p className={styles.subtitle}>
          Genera reportes detallados en múltiples formatos para análisis.
        </p>
      </header>

      <div className={styles.card}>

        {/* Toggle Opciones Avanzadas (ID Encuesta) */}
        <button
          className={styles.advancedToggle}
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        >
          <FaCog /> {showAdvancedOptions ? 'Ocultar Opciones Avanzadas' : 'Configurar ID de Encuesta'}
        </button>

        {showAdvancedOptions && (
          <div className={styles.advancedSection}>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label className={styles.label}>ID de Encuesta a Exportar</label>
              <input
                type="number"
                className={styles.input}
                value={surveyId}
                onChange={(e) => setSurveyId(e.target.value)}
                placeholder="Ej: 1"
                min="1"
              />
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                Por defecto es "1" (Estudio Cáncer Gástrico). Cambie este valor si desea exportar otra encuesta.
              </p>
            </div>
          </div>
        )}

        {/* Tabs de Selección */}
        <div className={styles.tabs}>
          <button
            onClick={() => setExportMode('all')}
            className={`${styles.tab} ${exportMode === 'all' ? styles.activeTab : ''}`}
          >
            <FaUsers /> Todos los Pacientes
          </button>
          <button
            onClick={() => setExportMode('patient')}
            className={`${styles.tab} ${exportMode === 'patient' ? styles.activeTab : ''}`}
          >
            <FaUser /> Paciente Específico
          </button>
        </div>

        {/* Selección de Paciente (Condicional) */}
        {exportMode === 'patient' && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Seleccionar Paciente</label>
            <select
              className={styles.select}
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              disabled={loadingPatients}
            >
              <option value="">-- Busque un paciente --</option>
              {patients.map(p => (
                <option key={p.idPaciente} value={p.idPaciente}>
                  {p.rut} - {p.nombre} {p.apellidos}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mensaje de Error */}
        {error && (
          <div className={styles.errorMsg}>
            <FaExclamationCircle /> {error}
          </div>
        )}

        {/* Botones de Acción */}
        <div className={styles.sectionTitle}>Formatos Disponibles</div>
        <div className={styles.exportGrid}>

          <button
            className={styles.exportBtn}
            onClick={() => handleExport('excel')}
            disabled={loading}
          >
            <FaFileExcel size={30} color="#16a34a" style={{ marginBottom: '10px' }} />
            Excel (.xlsx)
          </button>

          <button
            className={styles.exportBtn}
            onClick={() => handleExport('csv')}
            disabled={loading}
          >
            <FaFileCsv size={30} color="#2563eb" style={{ marginBottom: '10px' }} />
            CSV (Stata)
          </button>

          <button
            className={styles.exportBtn}
            onClick={() => handleExport('pdf')}
            disabled={loading}
          >
            <FaFilePdf size={30} color="#dc2626" style={{ marginBottom: '10px' }} />
            PDF (Leyenda)
          </button>

        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className={styles.loadingBox}>
            <p>Generando archivo, por favor espere...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportDataView;