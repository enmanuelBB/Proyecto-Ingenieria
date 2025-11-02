// Ubicación: encuesta/dto/RespuestaRequestDto.java
package com.v1.proyecto.encuesta.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaRequestDto { 
    @NotNull
    private Integer idPregunta;
    private Integer idOpcionSeleccionada; 
    private String valorTexto; 
}