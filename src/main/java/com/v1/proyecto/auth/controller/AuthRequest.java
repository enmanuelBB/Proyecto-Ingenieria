package com.v1.proyecto.auth.controller;

public record AuthRequest(
        String email,
        String password
) {
}
