package com.v1.proyecto.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(

        @NotBlank(message = "El nombre no puede estar vacío")
        String name,

        @NotBlank(message = "El apellido no puede estar vacío")
        String lastname,

        @NotBlank(message = "El email no puede estar vacío")
        @Email(message = "El formato del email no es válido")
        String email,

        @NotBlank(message = "La contraseña no puede estar vacía")
        String password
) {
}
