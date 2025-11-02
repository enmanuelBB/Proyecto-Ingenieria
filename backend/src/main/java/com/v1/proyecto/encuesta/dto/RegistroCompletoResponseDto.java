package com.v1.proyecto.encuesta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroCompletoResponseDto {
    private Integer idRegistro;
    private Integer idPaciente;
    private String nombrePaciente;
    private Integer idEncuesta;
    private String tituloEncuesta;
    private LocalDateTime fechaRealizacion;
    private String usuarioNombre; // El médico/usuario que llenó la encuesta
    private List<RespuestaDetalladaDto> respuestas;
}
