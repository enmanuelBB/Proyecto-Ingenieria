'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaClipboardList, FaUserCheck, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';

// Interfaces (Should be in a shared types file, but defining here for now based on what we know)
interface Encuesta {
    idEncuesta: number;
    titulo: string;
    descripcion?: string;
    version?: string;
}

interface RegistroCompleto {
    idRegistro: number;
    fechaRealizacion: string;
    paciente: {
        idPaciente: number;
        nombre: string;
        rut: string; // Assuming 'rut' exists or similar
    };
    usuario: {
        username: string;
    };
}

export default function EncuestaIntermediatePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [encuesta, setEncuesta] = useState<Encuesta | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [hasResponded, setHasResponded] = useState<boolean>(false);
    const [registros, setRegistros] = useState<RegistroCompleto[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const storedRole = localStorage.getItem('userRole');

        if (!token) {
            router.push('/');
            return;
        }
        setRole(storedRole);

        const fetchData = async () => {
            try {
                // 1. Fetch Survey Details
                const surveyRes = await fetch(`http://localhost:8080/api/v1/encuestas/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!surveyRes.ok) throw new Error('Error al cargar la encuesta');
                const surveyData = await surveyRes.json();
                setEncuesta(surveyData);

                // 2. Fetch User Status (Did I respond?)
                const statusRes = await fetch(`http://localhost:8080/api/v1/encuestas/${id}/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    setHasResponded(statusData);
                }

                // 3. If Admin, fetch all responses
                if (storedRole === 'ADMIN') {
                    const regRes = await fetch(`http://localhost:8080/api/v1/encuestas/${id}/registros`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (regRes.ok) {
                        const regData = await regRes.json();
                        setRegistros(regData);
                    }
                }

            } catch (err: any) {
                setError(err.message || 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, router]);

    const handleResponder = () => {
        router.push(`/responder-encuesta/${id}`);
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
    if (!encuesta) return <div className="p-8">No se encontró la encuesta.</div>;

    const isAdmin = role === 'ADMIN';

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
                <FaArrowLeft className="mr-2" /> Volver
            </button>

            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-indigo-600 p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">{encuesta.titulo}</h1>
                    <p className="opacity-90">Gestión y Respuestas</p>
                    <div className="mt-2 text-sm bg-indigo-500 inline-block px-3 py-1 rounded-full">
                        Versión: {encuesta.version || '1.0'}
                    </div>
                </div>

                <div className="p-8">
                    {/* ADMIN VIEW */}
                    {isAdmin && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                    <FaUserCheck className="mr-2 text-indigo-600" />
                                    Panel de Administrador
                                </h2>
                                <button
                                    onClick={handleResponder}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
                                >
                                    Responder por Paciente
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <div className="text-blue-500 text-sm font-semibold uppercase">Total Respuestas</div>
                                    <div className="text-3xl font-bold text-gray-800 mt-1">{registros.length}</div>
                                </div>
                                {/* Add more stats here if needed */}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                            <th className="p-3 border-b">ID</th>
                                            <th className="p-3 border-b">Paciente</th>
                                            <th className="p-3 border-b">Fecha</th>
                                            <th className="p-3 border-b">Usuario</th>
                                            <th className="p-3 border-b">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700 text-sm">
                                        {registros.map((reg) => (
                                            <tr key={reg.idRegistro} className="hover:bg-gray-50 border-b last:border-0">
                                                <td className="p-3">#{reg.idRegistro}</td>
                                                <td className="p-3 font-medium">{reg.paciente?.nombre || 'N/A'}</td>
                                                <td className="p-3">{new Date(reg.fechaRealizacion).toLocaleDateString()}</td>
                                                <td className="p-3">{reg.usuario?.username}</td>
                                                <td className="p-3">
                                                    <button className="text-indigo-600 hover:text-indigo-800 mr-2">Ver</button>
                                                    {/* <button className="text-red-600 hover:text-red-800">Eliminar</button> */}
                                                </td>
                                            </tr>
                                        ))}
                                        {registros.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                                    No hay respuestas registradas aún.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* USER VIEW */}
                    {!isAdmin && (
                        <div className="text-center py-10">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Estado de tu Encuesta</h2>

                            {hasResponded ? (
                                <div className="flex flex-col items-center">
                                    <FaCheckCircle className="text-6xl text-green-500 mb-4" />
                                    <p className="text-xl text-gray-700 mb-6">
                                        ¡Ya has completado esta encuesta!
                                    </p>
                                    <button
                                        className="bg-gray-200 text-gray-600 px-6 py-2 rounded-full cursor-not-allowed"
                                        disabled
                                    >
                                        Encuesta Completada
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <FaClipboardList className="text-6xl text-indigo-500 mb-4" />
                                    <p className="text-xl text-gray-700 mb-6">
                                        Tienes pendiente responder esta encuesta.
                                    </p>
                                    <button
                                        onClick={handleResponder}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-3 rounded-full transition-transform transform hover:scale-105 shadow-lg"
                                    >
                                        Responder Encuesta Ahora
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
