"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';
import { FaUserPlus, FaSearch, FaFileMedical } from 'react-icons/fa'; 
import Swal from 'sweetalert2';

interface Paciente {
  idPaciente: number;
  rut: string;
  nombre: string;
  apellidos: string;
  sexo: string;
  fechaNacimiento: string;
}

export default function PacientesPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 1. Estado para el rol
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/');
      return;
    }

    // 2. Lógica para obtener el rol del token 
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);
      if (decoded.authorities && Array.isArray(decoded.authorities)) {
        const r = decoded.authorities[0]?.authority || decoded.authorities[0] || "";
        setRole(r.replace("ROLE_", ""));
      }
    } catch (e) {
      console.error("Error decodificando token", e);
    }

    const fetchPacientes = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/pacientes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          // Ordenamos para ver los nuevos primero (opcional)
          data.sort((a: Paciente, b: Paciente) => b.idPaciente - a.idPaciente);
          setPacientes(data);
        }
      } catch (error) {
        console.error("Error cargando pacientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, [router]);

  const filteredPacientes = pacientes.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.rut.includes(searchTerm)
  );

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer. Se eliminará el paciente y todos sus registros asociados.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/v1/pacientes/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          setPacientes(prev => prev.filter(p => p.idPaciente !== id));
          Swal.fire(
            '¡Eliminado!',
            'El paciente ha sido eliminado correctamente.',
            'success'
          );
        } else {
          Swal.fire('Error', 'No se pudo eliminar el paciente.', 'error');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Ocurrió un error al conectar con el servidor.', 'error');
      }
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.welcomeText}>
          <h1>Gestión de Pacientes</h1>
          <p>Consulta y administra la base de datos de participantes.</p>
        </div>

        <button
          className={styles.actionButton}
          style={{ width: 'auto', backgroundColor: '#4f46e5', color: 'white' }}
          onClick={() => router.push('/dashboard/pacientes/nuevo')}
        >
          <FaUserPlus /> Nuevo Paciente
        </button>

      </header>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <FaSearch style={{ position: 'absolute', left: '15px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o RUT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.7rem 1rem 0.7rem 2.5rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.95rem'
            }}
          />
        </div>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>RUT</th>
              <th>Nombre Completo</th>
              <th>Sexo</th>
              <th>F. Nacimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Cargando pacientes...</td></tr>
            ) : filteredPacientes.length > 0 ? (
              filteredPacientes.map((p) => (
                <tr key={p.idPaciente}>
                  <td>{p.idPaciente}</td>
                  <td>{p.rut}</td>
                  <td style={{ fontWeight: '500' }}>{p.nombre} {p.apellidos}</td>
                  <td>{p.sexo}</td>
                  <td>{new Date(p.fechaNacimiento).toLocaleDateString()}</td>
                  <td>
                    
                    {/* --- 3. BOTÓN VER FICHA (SOLO ADMIN) --- */}
                    {role === 'ADMIN' && (
                        <button
                          style={{ 
                            color: '#3b82f6', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            marginRight: '10px', 
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={() => router.push(`/dashboard/pacientes/${p.idPaciente}`)}
                          title="Ver Ficha Clínica Detallada"
                        >
                          <FaFileMedical /> Ver Ficha
                        </button>
                    )}

                    <button
                      style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }}
                      onClick={() => router.push(`/dashboard/pacientes/editar/${p.idPaciente}`)}
                    >
                      Editar
                    </button>
                    <button
                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                      onClick={() => handleDelete(p.idPaciente)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron pacientes.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}