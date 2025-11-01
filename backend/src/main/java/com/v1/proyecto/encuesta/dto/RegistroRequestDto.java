// Ubicación: encuesta/dto/RegistroRequestDto.java
package com.v1.proyecto.encuesta.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class RegistroRequestDto {
    @NotNull
    private Integer idPaciente;
    
    @NotNull
    private Integer idEncuesta;
    
  
    private List<RespuestaRequestDto> respuestas;
}