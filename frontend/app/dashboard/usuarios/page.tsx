"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";
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
                router.push("/login"); // Adjust if login route is different
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
                // Update local state
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
                    <FaSearch style={{ position: "absolute", top: "10px", left: "10px", color: "#888" }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.5rem 0.5rem 0.5rem 2.5rem",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                        }}
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ padding: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}
                >
                    <option value="ALL">Todos los Roles</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                    <option value="ANALISTA">ANALISTA</option>
                    <option value="INVESTIGADOR">INVESTIGADOR</option>
                </select>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #e9ecef" }}>
                        <tr>
                            <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
                            <th style={{ padding: "1rem", textAlign: "left" }}>Nombre</th>
                            <th style={{ padding: "1rem", textAlign: "left" }}>Email</th>
                            <th style={{ padding: "1rem", textAlign: "left" }}>Rol</th>
                            <th style={{ padding: "1rem", textAlign: "center" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                                <td style={{ padding: "1rem" }}>{user.id}</td>
                                <td style={{ padding: "1rem" }}>{user.name} {user.lastname}</td>
                                <td style={{ padding: "1rem" }}>{user.email}</td>
                                <td style={{ padding: "1rem" }}>
                                    <span
                                        style={{
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "4px",
                                            backgroundColor:
                                                user.role === "ADMIN" ? "#d4edda" :
                                                    user.role === "ANALISTA" ? "#cce5ff" :
                                                        user.role === "INVESTIGADOR" ? "#fff3cd" : "#e2e3e5",
                                            color:
                                                user.role === "ADMIN" ? "#155724" :
                                                    user.role === "ANALISTA" ? "#004085" :
                                                        user.role === "INVESTIGADOR" ? "#856404" : "#383d41",
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
                    <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "8px", width: "90%", maxWidth: "400px" }}>
                        <h2>Editar Rol</h2>
                        <p className="mb-4">Usuario: {selectedUser?.name} {selectedUser?.lastname}</p>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem" }}>Rol:</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
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
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    background: "white",
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
