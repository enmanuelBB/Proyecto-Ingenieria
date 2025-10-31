package com.v1.proyecto.auth.dto;

public record LoginRequest(
        String email,
        String password
) {
}
