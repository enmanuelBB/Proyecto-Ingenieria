"use client";

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileBarChart, Eye, X } from 'lucide-react';

interface SurveyData {
  id: number;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
  respuestas: Array<{
    id: number;
    pacienteNombre: string;
    pacienteRut: string;
    fechaRespuesta: string;
    datos: Record<string, any>;
  }>;
}

const ExportDataView = () => {
  const [surveyId, setSurveyId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<SurveyData | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);

  const fetchPreview = async () => {
    if (!surveyId) {
      setError('⚠️ Por favor ingrese un ID de encuesta para comenzar.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('🔒 No hay sesión activa. Por favor inicie sesión nuevamente.');
      return;
    }

    setLoadingPreview(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const url = `${baseUrl}/api/v1/encuestas/${surveyId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Encuesta con ID ${surveyId} no encontrada.`);
        }
        if (response.status === 403) {
          throw new Error('No tiene permisos para ver esta encuesta.');
        }
        throw new Error(`Error ${response.status}: Fallo al cargar la vista previa.`);
      }

      const data = await response.json();
      setPreviewData(data);
      setShowPreview(true);

    } catch (error: any) {
      console.error('Preview error:', error);
      setError(error.message || '🚫 Error al cargar la vista previa.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    setError(null);

    if (!surveyId) {
      setError('⚠️ Por favor ingrese un ID de encuesta para comenzar.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('🔒 No hay sesión activa. Por favor inicie sesión nuevamente.');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const url = `${baseUrl}/api/v1/encuestas/${surveyId}/export/${format}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Encuesta con ID ${surveyId} no encontrada.`);
        }
        if (response.status === 403) {
          throw new Error('No tiene permisos para exportar esta encuesta.');
        }
        throw new Error(`Error ${response.status}: Fallo al exportar los datos.`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const extension = format === 'excel' ? 'xlsx' : format;
      a.download = `datos_encuesta_${surveyId}.${extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error: any) {
      console.error('Export error:', error);
      setError(error.message || '🚫 Error desconocido al exportar. Verifique el ID.');
    } finally {
      setLoading(false);
    }
  };

  const ExportButton = ({ format, icon: Icon, label, color, fullWidth = false }: {
    format: 'excel' | 'pdf' | 'csv';
    icon: React.ElementType;
    label: string;
    color: string;
    fullWidth?: boolean;
  }) => (
    <button
      onClick={() => handleExport(format)}
      disabled={loading || loadingPreview}
      style={{
        background: (loading || loadingPreview) ? '#9CA3AF' : color,
        transition: 'all 0.3s ease',
        transform: (loading || loadingPreview) ? 'none' : 'scale(1)',
        width: '100%',
        flex: fullWidth ? 'none' : 1
      }}
      onMouseEnter={(e) => !(loading || loadingPreview) && (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={(e) => !(loading || loadingPreview) && (e.currentTarget.style.transform = 'scale(1)')}
      className={`flex items-center justify-center px-6 py-4 rounded-xl font-semibold text-white shadow-lg ${(loading || loadingPreview) ? 'cursor-not-allowed opacity-60' : 'hover:shadow-xl'}`}
    >
      <Icon className="w-5 h-5 mr-2" />
      <span>{loading ? 'Preparando...' : label}</span>
    </button>
  );

  return (
    <div style={{
      padding: '24px',
      background: 'linear-gradient(to bottom right, #EFF6FF, #FFFFFF, #F3E8FF)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{
            background: 'linear-gradient(to bottom right, #2563EB, #9333EA)',
            padding: '12px',
            borderRadius: '12px',
            marginRight: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <Download style={{ width: '28px', height: '28px', color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '30px',
            fontWeight: 'bold',
            color: '#1F2937'
          }}>
            Exportar Datos de Encuestas
          </h1>
        </div>
        <p style={{ color: '#4B5563', fontSize: '16px', marginTop: '8px' }}>
          Seleccione el ID de la encuesta y el formato de archivo deseado para su descarga.
        </p>
      </header>

      {/* Tarjeta Principal */}
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '2px solid #DBEAFE',
        maxWidth: '768px',
        margin: '0 auto'
      }}>
        {/* Header de la tarjeta */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(to bottom right, #3B82F6, #9333EA)',
            padding: '12px',
            borderRadius: '12px',
            marginRight: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <FileText style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1F2937'
            }}>
              Opciones de Exportación
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              marginTop: '4px'
            }}>
              Los datos se generarán y se descargarán automáticamente a su equipo.
            </p>
          </div>
        </div>

        {/* Campo de ID */}
        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="surveyId"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}
          >
            ID de Encuesta
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="number"
              id="surveyId"
              value={surveyId}
              onChange={(e) => setSurveyId(e.target.value)}
              min="1"
              placeholder="Ingrese el número de ID de la encuesta, ej: 42"
              style={{
                flex: 1,
                border: '2px solid #D1D5DB',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '18px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3B82F6';
                e.target.style.outline = 'none';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              }}
            />
            <button
              onClick={fetchPreview}
              disabled={loadingPreview || loading}
              style={{
                background: (loadingPreview || loading) ? '#9CA3AF' : 'linear-gradient(to bottom right, #8B5CF6, #7C3AED)',
                padding: '16px 24px',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                cursor: (loadingPreview || loading) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!(loadingPreview || loading)) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(loadingPreview || loading)) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <Eye style={{ width: '20px', height: '20px' }} />
              {loadingPreview ? 'Cargando...' : 'Vista Previa'}
            </button>
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            borderLeft: '4px solid #EF4444',
            color: '#991B1B',
            padding: '16px 20px',
            borderRadius: '8px',
            marginBottom: '24px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', marginRight: '12px' }}>⚠️</span>
              <span style={{ fontWeight: '500' }}>{error}</span>
            </div>
          </div>
        )}

        {/* Botones de Exportación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <ExportButton
              format="excel"
              icon={FileSpreadsheet}
              label="Excel"
              color="linear-gradient(to bottom right, #16A34A, #15803D)"
            />
            <ExportButton
              format="pdf"
              icon={FileText}
              label="PDF"
              color="linear-gradient(to bottom right, #DC2626, #B91C1C)"
            />
          </div>
          <ExportButton
            format="csv"
            icon={FileBarChart}
            label="CSV"
            color="linear-gradient(to bottom right, #2563EB, #9333EA)"
            fullWidth={true}
          />
        </div>

        {/* Indicador de Carga */}
        {loading && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#EFF6FF',
            borderRadius: '8px',
            border: '1px solid #BFDBFE'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #BFDBFE',
                borderTopColor: '#2563EB',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '12px'
              }} />
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1E40AF'
              }}>
                Generando archivo... Esto puede tardar unos segundos
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Vista Previa */}
      {showPreview && previewData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}
          onClick={() => setShowPreview(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div style={{
              padding: '24px',
              borderBottom: '2px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(to right, #EFF6FF, #F3E8FF)'
            }}>
              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  marginBottom: '4px'
                }}>
                  Vista Previa de Datos
                </h3>
                <p style={{ fontSize: '14px', color: '#6B7280' }}>
                  Encuesta ID: {previewData.id}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#DC2626'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#EF4444'}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div style={{ padding: '24px' }}>
              {/* Información de la Encuesta */}
              <div style={{
                background: 'linear-gradient(to right, #EFF6FF, #F3E8FF)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid #DBEAFE'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  marginBottom: '12px'
                }}>
                  📋 Información General
                </h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', fontSize: '14px' }}>
                    <span style={{ fontWeight: '600', color: '#4B5563', minWidth: '140px' }}>Título:</span>
                    <span style={{ color: '#1F2937' }}>{previewData.titulo}</span>
                  </div>
                  <div style={{ display: 'flex', fontSize: '14px' }}>
                    <span style={{ fontWeight: '600', color: '#4B5563', minWidth: '140px' }}>Descripción:</span>
                    <span style={{ color: '#1F2937' }}>{previewData.descripcion || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', fontSize: '14px' }}>
                    <span style={{ fontWeight: '600', color: '#4B5563', minWidth: '140px' }}>Fecha Creación:</span>
                    <span style={{ color: '#1F2937' }}>
                      {new Date(previewData.fechaCreacion).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', fontSize: '14px' }}>
                    <span style={{ fontWeight: '600', color: '#4B5563', minWidth: '140px' }}>Total Respuestas:</span>
                    <span style={{ color: '#1F2937', fontWeight: 'bold' }}>
                      {previewData.respuestas?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabla de Respuestas */}
              {previewData.respuestas && previewData.respuestas.length > 0 ? (
                <div>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1F2937',
                    marginBottom: '16px'
                  }}>
                    📊 Respuestas Registradas
                  </h4>
                  <div style={{
                    overflowX: 'auto',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '14px'
                    }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                          <th style={{
                            padding: '12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#374151',
                            borderBottom: '2px solid #E5E7EB'
                          }}>ID</th>
                          <th style={{
                            padding: '12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#374151',
                            borderBottom: '2px solid #E5E7EB'
                          }}>Paciente</th>
                          <th style={{
                            padding: '12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#374151',
                            borderBottom: '2px solid #E5E7EB'
                          }}>RUT</th>
                          <th style={{
                            padding: '12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#374151',
                            borderBottom: '2px solid #E5E7EB'
                          }}>Fecha Respuesta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.respuestas.slice(0, 5).map((respuesta, index) => (
                          <tr key={respuesta.id} style={{
                            background: index % 2 === 0 ? 'white' : '#F9FAFB'
                          }}>
                            <td style={{
                              padding: '12px',
                              borderBottom: '1px solid #E5E7EB',
                              color: '#6B7280'
                            }}>{respuesta.id}</td>
                            <td style={{
                              padding: '12px',
                              borderBottom: '1px solid #E5E7EB',
                              color: '#1F2937',
                              fontWeight: '500'
                            }}>{respuesta.pacienteNombre}</td>
                            <td style={{
                              padding: '12px',
                              borderBottom: '1px solid #E5E7EB',
                              color: '#6B7280'
                            }}>{respuesta.pacienteRut}</td>
                            <td style={{
                              padding: '12px',
                              borderBottom: '1px solid #E5E7EB',
                              color: '#6B7280'
                            }}>
                              {new Date(respuesta.fechaRespuesta).toLocaleDateString('es-CL')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {previewData.respuestas.length > 5 && (
                    <p style={{
                      marginTop: '12px',
                      fontSize: '14px',
                      color: '#6B7280',
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}>
                      Mostrando 5 de {previewData.respuestas.length} respuestas.
                      Exporte para ver todos los datos completos.
                    </p>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  background: '#F9FAFB',
                  borderRadius: '8px',
                  color: '#6B7280'
                }}>
                  <p style={{ fontSize: '16px' }}>
                    📭 No hay respuestas registradas para esta encuesta
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tarjeta Informativa */}
      <div style={{
        maxWidth: '768px',
        margin: '24px auto 0',
        padding: '20px',
        background: 'linear-gradient(to right, #EFF6FF, #F3E8FF)',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #DBEAFE'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>💡</span>
          <div>
            <h3 style={{
              fontWeight: '600',
              color: '#1F2937',
              marginBottom: '4px'
            }}>
              Nota Importante
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#4B5563',
              lineHeight: '1.5'
            }}>
              La correcta exportación depende de que el ID de la encuesta sea válido y de sus permisos de usuario. Los archivos se generan con los datos más recientes disponibles.
            </p>
          </div>
        </div>
      </div>

      {/* Agregar keyframes para la animación del spinner */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default ExportDataView;