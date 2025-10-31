package com.v1.proyecto.auth.dto;

public record RegisterRequest(
        String email,
        String lastname,
        String password,
        String name
) {
}
