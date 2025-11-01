package com.v1.proyecto.encuesta.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OpcionRespuestaDto {
    private Integer idOpcion;
    private String textoOpcion;
}