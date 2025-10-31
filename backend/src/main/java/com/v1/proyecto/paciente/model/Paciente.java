package com.v1.proyecto.paciente.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

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

    @Column(nullable = false, unique = true)
    private String rut;

    @Column
    private String nombre;

    @Column
    private String apellidos;

    @Column
    private String sexo;

    @Temporal(TemporalType.DATE)
    @Column(name = "fecha_nacimiento")
    private Date fechaNacimiento;

    // --- Relación del Diagrama ---

   // @OneToMany(mappedBy = "paciente", fetch = FetchType.LAZY)
    //private List<RegistroEncuesta> registros;
}
