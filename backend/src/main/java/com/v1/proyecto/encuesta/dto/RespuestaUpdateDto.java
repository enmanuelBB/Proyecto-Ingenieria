package com.v1.proyecto.encuesta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaUpdateDto {
    private Integer idOpcionSeleccionada;
    private String valorTexto;
}
