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
public class PreguntaDto {
    private Integer idPregunta;
    private String textoPregunta;
    private String tipoPregunta;
    private boolean obligatoria;
    private List<OpcionRespuestaDto> opciones;
}