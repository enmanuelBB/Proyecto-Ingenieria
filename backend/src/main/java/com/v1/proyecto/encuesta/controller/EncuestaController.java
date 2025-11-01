package com.v1.proyecto.encuesta.controller;

import com.v1.proyecto.auth.model.Users;
import com.v1.proyecto.encuesta.dto.EncuestaResponseDto;
import com.v1.proyecto.encuesta.dto.RegistroRequestDto;
import com.v1.proyecto.encuesta.dto.RegistroResponseDto;
import com.v1.proyecto.encuesta.service.EncuestaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/encuestas")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
public class EncuestaController {

    private final EncuestaService encuestaService;

    /**
     * Endpoint para OBTENER la estructura completa de una encuesta (para el frontend).
     * URL: GET /api/v1/encuestas/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<EncuestaResponseDto> getEncuestaCompleta(@PathVariable Integer id) {
        EncuestaResponseDto encuestaDto = encuestaService.getEncuestaCompleta(id);
        return ResponseEntity.ok(encuestaDto);
        // TODO: Manejar Not Found Exception si el service la lanza
    }

    /**
     * Endpoint para GUARDAR las respuestas de una encuesta completada.
     * URL: POST /api/v1/encuestas/registro
     */
    @PostMapping("/registro")
    public ResponseEntity<RegistroResponseDto> saveRegistroEncuesta(
            @Valid @RequestBody RegistroRequestDto registroDto,
            @AuthenticationPrincipal Users user // Inyecta el usuario autenticado
    ) {
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        RegistroResponseDto respuesta = encuestaService.saveRegistro(registroDto, user);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
        // TODO: Manejar excepciones
    }
}