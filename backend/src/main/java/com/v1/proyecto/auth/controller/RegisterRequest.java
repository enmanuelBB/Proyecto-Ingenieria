package com.v1.proyecto.auth.controller;

public record RegisterRequest(
        String email,
        String lastname,
        String password,
        String name
) {
}
