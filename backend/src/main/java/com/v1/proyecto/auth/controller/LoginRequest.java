package com.v1.proyecto.auth.controller;

public record LoginRequest(
        String email,
        String password
) {
}
