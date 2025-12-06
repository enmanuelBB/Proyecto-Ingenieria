package com.v1.proyecto.paciente.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteRequestDto {

    // --- 1. IDENTIFICACIÓN DEL PARTICIPANTE ---

    @NotBlank(message = "El RUT es obligatorio")
    @Size(min = 8, max = 12, message = "Formato de RUT inválido")
    private String rut;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "Los apellidos son obligatorios")
    private String apellidos;

    private String telefono;

    @Email(message = "Formato de email inválido")
    private String email;

    private String codigoParticipante; // Ej: P-001

    @NotBlank(message = "El grupo (Caso/Control) es obligatorio")
    private String grupo;
    private Date fechaInclusion;

    // --- 2. DATOS SOCIODEMOGRÁFICOS ---

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Past(message = "La fecha de nacimiento debe ser en el pasado")
    private Date fechaNacimiento;

    @NotBlank(message = "El sexo es obligatorio")
    private String sexo;

    private String nacionalidad;
    private String direccion;
    private String comuna;
    private String ciudad;
    private String zona; // "Urbana" o "Rural"

    private Boolean viveZonaMas5Anios; // true/false

    private String nivelEducacional; // Básico, Medio, Superior
    private String ocupacion;
    private String prevision; // Fonasa, Isapre, etc.

    // --- 3. ANTECEDENTES CLÍNICOS ---

    private Boolean diagnosticoCancer; // Solo casos
    private Date fechaDiagnostico; // Solo casos

    private Boolean antecedentesFamCancerGastrico;
    private Boolean antecedentesFamOtrosCancer;
    private String detalleOtrosCancer; // Cuál(es)

    private String enfermedadesRelevantes; // Gastritis, úlcera, etc.

    private Boolean usoCronicoMedicamentos; // AINEs, etc.

    private Boolean cirugiaGastricaPrevia;

    // --- 4. VARIABLES ANTROPOMÉTRICAS ---

    @NotNull(message = "El peso es obligatorio")
    private Double peso;

    @NotNull(message = "La estatura es obligatoria")
    private Double estatura;

    // (El IMC lo calculamos en el front o en el servicio, no es necesario
    // recibirlo)

    // --- 9. HISTOPATOLOGÍA (Solo Casos) ---

    private String tipoHistologico; // Intestinal, Difuso, Mixto...
    private String localizacionTumoral; // Cardias, Cuerpo, Antro...
    private String estadioTNM;
}