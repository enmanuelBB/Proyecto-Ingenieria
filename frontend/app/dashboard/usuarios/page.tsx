"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./users.module.css";
import { FaEdit, FaSearch } from "react-icons/fa";

interface User {
    id: number;
    name: string;
    lastname: string;
    email: string;
    role: string;
    phone_number?: string;
    address?: string;
}

export default function UsuariosPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRole, setNewRole] = useState("");

    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetch("http://localhost:8080/api/v1/user", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error("Error fetching users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setIsModalOpen(true);
    };

    const handleRoleUpdate = async () => {
        if (!selectedUser) return;

        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`http://localhost:8080/api/v1/user/${selectedUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...selectedUser,
                    role: newRole,
                }),
            });

            if (response.ok) {
                setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u)));
                setIsModalOpen(false);
            } else {
                const errorText = await response.text();
                alert(`Error: ${errorText}`);
            }
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Error al conectar con el servidor");
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    if (loading) return <div>Cargando usuarios...</div>;


    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className={styles.title} style={{ margin: 0 }}>Gestión de Usuarios</h1>
            </div>

            <div 
                style={{ 
                    display: "flex", 
                    gap: "1rem", 
                    marginBottom: "1.5rem", 
                    flexWrap: "wrap", // Permite que baje si la pantalla es muy pequeña (móvil)
                    alignItems: 'center'
                }}
            >
                {/* 1. Buscador (Ocupa el espacio restante) */}
                <div style={{ position: "relative", flex: "1 1 300px" }}> {/* flex-grow: 1, flex-shrink: 1, min-width: 300px */}
                    <FaSearch style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: "12px", color: "var(--text-muted)" }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.7rem 1rem 0.7rem 2.5rem", // Padding ajustado
                            borderRadius: "8px",
                            border: "1px solid var(--border-color)",
                            backgroundColor: "var(--bg-input)",
                            color: "var(--text-main)",
                            fontSize: "0.95rem"
                        }}
                    />
                </div>

                {/* 2. Selector de Rol (Ancho fijo cómodo) */}
                <div style={{ flex: "0 0 200px" }}> {/* No crece, no encoge, ancho base 200px */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{ 
                            width: "100%",
                            padding: "0.7rem 1rem", 
                            borderRadius: "8px", 
                            border: "1px solid var(--border-color)",
                            backgroundColor: "var(--bg-input)",
                            color: "var(--text-main)",
                            fontSize: "0.95rem",
                            cursor: 'pointer'
                        }}
                    >
                        <option value="ALL">Todos los Roles</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                        <option value="ANALISTA">ANALISTA</option>
                        <option value="INVESTIGADOR">INVESTIGADOR</option>
                    </select>
                </div>
            </div>

            {/* TABLA (Sin cambios mayores, solo estilos) */}
            <div style={{ 
                overflowX: "auto", 
                backgroundColor: "var(--bg-card)", 
                borderRadius: "12px", 
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid var(--border-color)"
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ backgroundColor: "var(--bg-hover)", borderBottom: "1px solid var(--border-color)" }}>
                        <tr>
                            <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)", fontSize: "0.85rem", textTransform: 'uppercase' }}>ID</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)", fontSize: "0.85rem", textTransform: 'uppercase' }}>Nombre</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)", fontSize: "0.85rem", textTransform: 'uppercase' }}>Email</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)", fontSize: "0.85rem", textTransform: 'uppercase' }}>Rol</th>
                            <th style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", textTransform: 'uppercase' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                    <td style={{ padding: "1rem", color: "var(--text-main)" }}>{user.id}</td>
                                    <td style={{ padding: "1rem", color: "var(--text-main)", fontWeight: '500' }}>{user.name} {user.lastname}</td>
                                    <td style={{ padding: "1rem", color: "var(--text-muted)" }}>{user.email}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <span
                                            style={{
                                                padding: "4px 10px",
                                                borderRadius: "20px",
                                                fontSize: "0.75rem",
                                                fontWeight: "600",
                                                backgroundColor:
                                                    user.role === "ADMIN" ? "rgba(34, 197, 94, 0.15)" : 
                                                        user.role === "ANALISTA" ? "rgba(59, 130, 246, 0.15)" : 
                                                            user.role === "INVESTIGADOR" ? "rgba(234, 179, 8, 0.15)" : "rgba(148, 163, 184, 0.15)",
                                                color:
                                                    user.role === "ADMIN" ? "#16a34a" :
                                                        user.role === "ANALISTA" ? "#2563eb" :
                                                            user.role === "INVESTIGADOR" ? "#ca8a04" : "#64748b",
                                                border: `1px solid ${
                                                    user.role === "ADMIN" ? "rgba(34, 197, 94, 0.3)" : 
                                                        user.role === "ANALISTA" ? "rgba(59, 130, 246, 0.3)" : 
                                                            user.role === "INVESTIGADOR" ? "rgba(234, 179, 8, 0.3)" : "rgba(148, 163, 184, 0.3)"
                                                }`
                                            }}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem", textAlign: "center" }}>
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            style={{
                                                background: "var(--bg-input)",
                                                border: "1px solid var(--border-color)",
                                                cursor: "pointer",
                                                color: "var(--primary)",
                                                padding: '6px',
                                                borderRadius: '6px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Editar Rol"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No se encontraron usuarios.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.6)", // Fondo más oscuro
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        backdropFilter: 'blur(2px)' // Efecto borroso suave
                    }}
                >
                    <div style={{ backgroundColor: "var(--bg-card)", padding: "2rem", borderRadius: "12px", width: "90%", maxWidth: "400px", border: "1px solid var(--border-color)", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}>
                        <h2 style={{color: "var(--text-main)", marginTop: 0}}>Editar Rol</h2>
                        <p style={{marginBottom: "1.5rem", color: "var(--text-muted)", fontSize: '0.9rem'}}>Usuario: <strong>{selectedUser?.name} {selectedUser?.lastname}</strong></p>

                        <div style={{ marginBottom: "2rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-main)", fontSize: '0.9rem', fontWeight: '500' }}>Seleccionar nuevo rol:</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                style={{ 
                                    width: "100%", 
                                    padding: "0.7rem", 
                                    borderRadius: "8px", 
                                    border: "1px solid var(--border-color)",
                                    backgroundColor: "var(--bg-input)",
                                    color: "var(--text-main)",
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="ANALISTA">ANALISTA</option>
                                <option value="INVESTIGADOR">INVESTIGADOR</option>
                            </select>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem" }}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    padding: "0.6rem 1.2rem",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "8px",
                                    background: "transparent",
                                    color: "var(--text-main)",
                                    cursor: "pointer",
                                    fontSize: '0.9rem',
                                    fontWeight: '500'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRoleUpdate}
                                style={{
                                    padding: "0.6rem 1.2rem",
                                    border: "none",
                                    borderRadius: "8px",
                                    background: "#3b82f6", // Azul moderno
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    boxShadow: '0 2px 5px rgba(59, 130, 246, 0.3)'
                                }}
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}