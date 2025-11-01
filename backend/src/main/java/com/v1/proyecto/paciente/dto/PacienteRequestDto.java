package com.v1.proyecto.paciente.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteRequestDto {

    @NotBlank(message = "El RUT no puede estar vacío")
    @Size(min = 8, max = 12, message = "El RUT debe tener un formato válido")
    private String rut;

    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;

    @NotBlank(message = "El apellido no puede estar vacío")
    private String apellidos;

    private String sexo;

    @Past(message = "La fecha de nacimiento debe ser una fecha pasada")
    private Date fechaNacimiento;
}
