"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEdit, FaClipboardList, FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';

interface RegistroBorrador {
    idRegistro: number;
    idPaciente: number;
    nombrePaciente: string;
    idEncuesta: number;
    tituloEncuesta: string;
    fechaRealizacion: string;
    usuarioNombre: string;
}

export default function BorradoresPage() {
    const router = useRouter();
    const [borradores, setBorradores] = useState<RegistroBorrador[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBorradores = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                router.push('/');
                return;
            }

            try {
                const res = await fetch('http://localhost:8080/api/v1/encuestas/borradores', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setBorradores(data);
                } else {
                    setError("No se pudieron cargar los borradores.");
                }
            } catch (err) {
                console.error(err);
                setError("Error de conexión.");
            } finally {
                setLoading(false);
            }
        };

        fetchBorradores();
    }, [router]);

    const handleContinue = (registro: RegistroBorrador) => {
        // Redirigir a la página de responder encuesta, pasando el idRegistro para cargar el borrador
        // Nota: Necesitaremos lógica en responder-encuesta para leer este query param
        router.push(`/responder-encuesta/${registro.idEncuesta}?registroId=${registro.idRegistro}`);
    };

    if (loading) return <div style={{ padding: '2rem' }}>Cargando borradores...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <button
                onClick={() => router.back()}
                style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
            >
                <FaArrowLeft /> Volver
            </button>

            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaClipboardList color="#f39c12" /> Borradores Pendientes
            </h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {borradores.length === 0 ? (
                <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
                    No tienes encuestas en borrador.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {borradores.map(b => (
                        <div key={b.idRegistro} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{b.tituloEncuesta}</h3>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d' }}>
                                <strong>Paciente:</strong> {b.nombrePaciente}
                            </p>
                            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#95a5a6' }}>
                                {new Date(b.fechaRealizacion).toLocaleString()}
                            </p>

                            <button
                                onClick={() => handleContinue(b)}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    background: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                <FaEdit /> Continuar Edición
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
