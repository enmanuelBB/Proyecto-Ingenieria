package com.v1.proyecto.encuesta.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class RegistroResponseDto {
    private Integer idRegistro;
    private Integer idPaciente;
    private LocalDateTime fechaRealizacion;
    private String usuarioNombre; // Nombre del médico
}