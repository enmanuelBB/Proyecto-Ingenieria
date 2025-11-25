package com.v1.proyecto.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordRequest {
    @NotBlank
    private String token; // El codigo que llego al correo

    @NotBlank(message = "La nueva contraseña es requerida")
    private String newPassword;
}
