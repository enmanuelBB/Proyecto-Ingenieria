// Ubicación: encuesta/dto/RespuestaRequestDto.java
package com.v1.proyecto.encuesta.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RespuestaRequestDto { 
    @NotNull
    private Integer idPregunta;
    
    private Integer idOpcionSeleccionada; 
    private String valorTexto; 
}