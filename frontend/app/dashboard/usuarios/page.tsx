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
            <h1 className={styles.title}>Gestión de Usuarios</h1>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <FaSearch style={{ position: "absolute", top: "10px", left: "10px", color: "var(--text-muted)" }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.5rem 0.5rem 0.5rem 2.5rem",
                            borderRadius: "5px",
                            border: "1px solid var(--border-color)",
                            backgroundColor: "var(--bg-input)",
                            color: "var(--text-main)"
                        }}
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ 
                        padding: "0.5rem", 
                        borderRadius: "5px", 
                        border: "1px solid var(--border-color)",
                        backgroundColor: "var(--bg-input)",
                        color: "var(--text-main)"
                    }}
                >
                    <option value="ALL">Todos los Roles</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                    <option value="ANALISTA">ANALISTA</option>
                    <option value="INVESTIGADOR">INVESTIGADOR</option>
                </select>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ 
                    width: "100%", 
                    borderCollapse: "collapse", 
                    backgroundColor: "var(--bg-card)", 
                    borderRadius: "8px", 
                    overflow: "hidden", 
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)" 
                }}>
                    <thead style={{ backgroundColor: "var(--bg-main)", borderBottom: "2px solid var(--border-color)" }}>
                        <tr>
                            <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)" }}>ID</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)" }}>Nombre</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)" }}>Email</th>
                            <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-muted)" }}>Rol</th>
                            <th style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-main)" }}>
                                <td style={{ padding: "1rem" }}>{user.id}</td>
                                <td style={{ padding: "1rem" }}>{user.name} {user.lastname}</td>
                                <td style={{ padding: "1rem" }}>{user.email}</td>
                                <td style={{ padding: "1rem" }}>
                                    <span
                                        style={{
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "4px",
                                            // Usamos rgba para que funcione bien en dark y light mode
                                            backgroundColor:
                                                user.role === "ADMIN" ? "rgba(34, 197, 94, 0.2)" : // Green
                                                    user.role === "ANALISTA" ? "rgba(59, 130, 246, 0.2)" : // Blue
                                                        user.role === "INVESTIGADOR" ? "rgba(234, 179, 8, 0.2)" : "rgba(148, 163, 184, 0.2)", // Yellow / Gray
                                            color:
                                                user.role === "ADMIN" ? "#22c55e" :
                                                    user.role === "ANALISTA" ? "#3b82f6" :
                                                        user.role === "INVESTIGADOR" ? "#eab308" : "#94a3b8",
                                            fontSize: "0.85rem",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: "1rem", textAlign: "center" }}>
                                    <button
                                        onClick={() => handleEditClick(user)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#007bff",
                                        }}
                                        title="Editar Rol"
                                    >
                                        <FaEdit size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
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
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div style={{ backgroundColor: "var(--bg-card)", padding: "2rem", borderRadius: "8px", width: "90%", maxWidth: "400px", border: "1px solid var(--border-color)" }}>
                        <h2 style={{color: "var(--text-main)"}}>Editar Rol</h2>
                        <p style={{marginBottom: "1rem", color: "var(--text-muted)"}}>Usuario: {selectedUser?.name} {selectedUser?.lastname}</p>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-main)" }}>Rol:</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                style={{ 
                                    width: "100%", 
                                    padding: "0.5rem", 
                                    borderRadius: "4px", 
                                    border: "1px solid var(--border-color)",
                                    backgroundColor: "var(--bg-input)",
                                    color: "var(--text-main)"
                                }}
                            >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="ANALISTA">ANALISTA</option>
                                <option value="INVESTIGADOR">INVESTIGADOR</option>
                            </select>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    padding: "0.5rem 1rem",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "4px",
                                    background: "var(--bg-input)",
                                    color: "var(--text-main)",
                                    cursor: "pointer",
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRoleUpdate}
                                style={{
                                    padding: "0.5rem 1rem",
                                    border: "none",
                                    borderRadius: "4px",
                                    background: "#007bff",
                                    color: "white",
                                    cursor: "pointer",
                                }}
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}