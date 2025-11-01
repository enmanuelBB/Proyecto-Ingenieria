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
public class PreguntaCreateDto {
    private String textoPregunta;
    private String tipoPregunta; // ej: "SELECCION_UNICA", "TEXTO_LIBRE"
    private List<OpcionRespuestaCreateDto> opciones; // Lista de opciones para esta pregunta
}
