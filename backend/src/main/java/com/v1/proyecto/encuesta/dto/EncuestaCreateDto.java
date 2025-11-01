package com.v1.proyecto.encuesta.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EncuestaCreateDto {
    @NotBlank
    private String titulo;
    private String version;
    private List<PreguntaCreateDto> preguntas; // Lista de preguntas para esta encuesta
}
