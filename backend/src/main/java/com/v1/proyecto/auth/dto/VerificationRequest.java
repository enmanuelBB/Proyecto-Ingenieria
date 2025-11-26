package com.v1.proyecto.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VerificationRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String code;

    private String deviceId;
    private boolean rememberDevice;
}
