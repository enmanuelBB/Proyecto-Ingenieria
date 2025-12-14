package com.v1.proyecto.encuesta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EncuestaResponseDto {
    private Integer idEncuesta;
    private String titulo;
    private String version;
    private List<PreguntaDto> preguntas;
  
}