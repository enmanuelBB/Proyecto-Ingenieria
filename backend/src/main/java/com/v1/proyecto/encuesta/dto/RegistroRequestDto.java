// Ubicación: encuesta/dto/RegistroRequestDto.java
package com.v1.proyecto.encuesta.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroRequestDto {
    @NotNull
    private Integer idPaciente;
    
    @NotNull
    private Integer idEncuesta;
    
  
    private List<RespuestaRequestDto> respuestas;
}