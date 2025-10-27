package com.v1.proyecto.auth.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/test")
public class TestController {

    @GetMapping("/hello")

    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> sayHelloAdmin() {
        return ResponseEntity.ok("¡Hola ADMIN! Has accedido a un endpoint protegido.");
    }

    @GetMapping("/hello-user")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<String> sayHelloUser() {
        return ResponseEntity.ok("¡Hola USER! Has accedido a un endpoint.");
    }
}
