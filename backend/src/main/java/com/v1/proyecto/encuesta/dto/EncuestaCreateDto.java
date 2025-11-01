package com.v1.proyecto.encuesta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class EncuestaCreateDto {
    @NotBlank
    private String titulo;
    private String version;
    private List<PreguntaCreateDto> preguntas; // Lista de preguntas para esta encuesta
}
