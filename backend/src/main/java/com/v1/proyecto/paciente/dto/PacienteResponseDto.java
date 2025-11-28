package com.v1.proyecto.paciente.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class PacienteResponseDto {

    private Integer idPaciente;
    private String rut;
    private String nombre;
    private String apellidos;
    private String sexo;
    private Date fechaNacimiento;



}
