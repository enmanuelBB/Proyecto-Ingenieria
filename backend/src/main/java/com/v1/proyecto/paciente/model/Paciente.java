package com.v1.proyecto.paciente.model;

// import com.v1.proyecto.encuesta.model.RegistroEncuesta;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "paciente")
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_paciente")
    private Integer idPaciente;

    // --- 1. IDENTIFICACIÓN ---
    @Column(nullable = false, unique = true)
    private String rut;

    private String nombre;
    private String apellidos;
    private String telefono;
    private String email;

    @Column(name = "codigo_participante")
    private String codigoParticipante; // Ej: P-001

    @Column(name = "grupo")
    private String grupo; // "CASO" o "CONTROL"

    @Temporal(TemporalType.DATE)
    @Column(name = "fecha_inclusion")
    private Date fechaInclusion;

    // --- 2. SOCIODEMOGRÁFICOS ---
    @Temporal(TemporalType.DATE)
    @Column(name = "fecha_nacimiento")
    private Date fechaNacimiento;

    private String sexo; // Hombre/Mujer
    private String nacionalidad;
    private String direccion;
    private String comuna;
    private String ciudad;
    private String zona; // Urbana/Rural

    @Column(name = "vive_zona_mas_5_anios")
    private Boolean viveZonaMas5Anios;

    @Column(name = "nivel_educacional")
    private String nivelEducacional; // Basico/Medio/Superior

    private String ocupacion;
    private String prevision; // Fonasa/Isapre/etc

    // --- 3. ANTECEDENTES CLÍNICOS ---
    // (Solo casos)
    @Column(name = "diagnostico_cancer")
    private Boolean diagnosticoCancer;

    @Temporal(TemporalType.DATE)
    @Column(name = "fecha_diagnostico")
    private Date fechaDiagnostico;

    @Column(name = "antecedentes_fam_cancer_gastrico")
    private Boolean antecedentesFamCancerGastrico;

    @Column(name = "antecedentes_fam_otros_cancer")
    private Boolean antecedentesFamOtrosCancer;

    @Column(name = "detalle_otros_cancer")
    private String detalleOtrosCancer;

    @Column(name = "enfermedades_relevantes")
    private String enfermedadesRelevantes; // Gastritis, úlcera, etc.

    @Column(name = "uso_cronico_medicamentos")
    private Boolean usoCronicoMedicamentos; // AINEs

    @Column(name = "cirugia_gastrica_previa")
    private Boolean cirugiaGastricaPrevia;

    // --- 4. ANTROPOMETRÍA ---
    private Double peso; // kg
    private Double estatura; // mts
    // El IMC se puede calcular, no es necesario guardarlo, pero si quieres:
    private Double imc;

    // --- 9. HISTOPATOLOGÍA (Solo Casos) ---
    @Column(name = "tipo_histologico")
    private String tipoHistologico; // Intestinal/Difuso/etc

    @Column(name = "localizacion_tumoral")
    private String localizacionTumoral; // Cardias/Cuerpo/etc

    @Column(name = "estadio_tnm")
    private String estadioTNM;

    // --- RELACIONES ---
    // @OneToMany(mappedBy = "paciente", fetch = FetchType.LAZY)
    // private List<RegistroEncuesta> registros;
}
