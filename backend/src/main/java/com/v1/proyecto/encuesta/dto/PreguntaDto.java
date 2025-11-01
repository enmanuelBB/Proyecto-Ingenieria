package com.v1.proyecto.encuesta.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PreguntaDto {
    private Integer idPregunta;
    private String textoPregunta;
    private String tipoPregunta;
    private List<OpcionRespuestaDto> opciones;
}