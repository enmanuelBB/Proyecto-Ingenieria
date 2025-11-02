package com.v1.proyecto.encuesta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroResponseDto {
    private Integer idRegistro;
    private Integer idPaciente;
    private LocalDateTime fechaRealizacion;
    private String usuarioNombre; // Nombre del médico
}