package com.v1.proyecto.auth.dto;

public record AuthRequest(
        String email,
        String password
) {
}
