package com.v1.proyecto.encuesta.controller;

import com.v1.proyecto.auth.model.Users;
import com.v1.proyecto.encuesta.dto.*;
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
public class EncuestaController {

    private final EncuestaService encuestaService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EncuestaResponseDto> createEncuesta(
            @Valid @RequestBody EncuestaCreateDto encuestaDto
    ) {
        EncuestaResponseDto encuestaCreada = encuestaService.createEncuestaCompleta(encuestaDto);
        return new ResponseEntity<>(encuestaCreada, HttpStatus.CREATED);
    }

    @PutMapping("/preguntas/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PreguntaDto> updatePregunta(
            @PathVariable(name = "id") Integer idPregunta,
            @Valid @RequestBody PreguntaCreateDto preguntaDto) {

        PreguntaDto preguntaActualizada = encuestaService.updatePregunta(idPregunta, preguntaDto);
        return ResponseEntity.ok(preguntaActualizada);
    }

    @PostMapping("/{idEncuesta}/preguntas")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PreguntaDto> addPreguntaToEncuesta(
            @PathVariable (name= "idEncuesta") Integer idEncuesta,
            @Valid @RequestBody PreguntaCreateDto preguntaDto
    ) {
        PreguntaDto nuevaPregunta = encuestaService.addPreguntaToEncuesta(idEncuesta, preguntaDto);
        return new ResponseEntity<>(nuevaPregunta, HttpStatus.CREATED);
    }

    /**
     * Endpoint para OBTENER la estructura completa de una encuesta (para el frontend).
     * URL: GET /api/v1/encuestas/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<EncuestaResponseDto> getEncuestaCompleta(@PathVariable(name = "id") Integer id) {
        EncuestaResponseDto encuestaDto = encuestaService.getEncuestaCompleta(id);
        return ResponseEntity.ok(encuestaDto);
    }

    /**
     * Endpoint para GUARDAR las respuestas de una encuesta completada.
     * URL: POST /api/v1/encuestas/registro
     */
    @PostMapping("/registro")
    public ResponseEntity<RegistroResponseDto> saveRegistroEncuesta(
            @Valid @RequestBody RegistroRequestDto registroDto,
            @AuthenticationPrincipal Users user
    ) {
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        RegistroResponseDto respuesta = encuestaService.saveRegistro(registroDto, user);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
        // TODO: Manejar excepciones
    }

    @DeleteMapping("/preguntas/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePregunta(
            @PathVariable (name= "id") Integer idPregunta
    ) {
        try {
            encuestaService.deletePregunta(idPregunta);
            return ResponseEntity.noContent().build(); // 204 (Éxito)
        } catch (RuntimeException e) {
            // Captura el "Pregunta no encontrada" del servicio
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EncuestaResponseDto> updateEncuesta(
            @PathVariable Integer id,
            @Valid @RequestBody EncuestaCreateDto encuestaDto) {

        EncuestaResponseDto encuestaActualizada = encuestaService.updateEncuesta(id, encuestaDto);
        return ResponseEntity.ok(encuestaActualizada); // Devuelve 200 OK
    }

    /**
     * Endpoint (SOLO ADMIN) para ELIMINAR una plantilla de encuesta.
     * URL: DELETE /api/v1/encuestas/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteEncuesta(@PathVariable(name = "id") Integer id) {
        try {
            encuestaService.deleteEncuesta(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (RuntimeException e) {
            // Esto captura el "Encuesta no encontrada" del servicio
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

}