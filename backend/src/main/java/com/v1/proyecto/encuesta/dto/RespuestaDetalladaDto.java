package com.v1.proyecto.encuesta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaDetalladaDto {
    private Integer idRespuesta;
    private Integer idPregunta;
    private String textoPregunta;
    private String respuestaDada;
    private Integer idOpcionSeleccionada;
}
