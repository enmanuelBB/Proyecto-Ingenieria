package com.v1.proyecto.encuesta.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OpcionRespuestaCreateDto {
    private String textoOpcion;
    private Integer valorDicotomizado; // Opcional
}
