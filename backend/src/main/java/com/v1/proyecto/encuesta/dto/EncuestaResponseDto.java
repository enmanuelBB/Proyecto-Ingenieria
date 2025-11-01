package com.v1.proyecto.encuesta.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class EncuestaResponseDto {
    private Integer idEncuesta;
    private String titulo;
    private List<PreguntaDto> preguntas;
  
}