package com.v1.proyecto.encuesta.controller;

import com.v1.proyecto.auth.model.Users;
import com.v1.proyecto.encuesta.dto.*;
import com.v1.proyecto.encuesta.service.EncuestaService;
import com.v1.proyecto.encuesta.service.ExportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
    private final ExportService exportService;

    // ---ENCUESTA--

    /**
     * CREAR ENCUESTA URL: POST /api/v1/encuestas
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EncuestaResponseDto> createEncuesta(
            @Valid @RequestBody EncuestaCreateDto encuestaDto) {
        EncuestaResponseDto encuestaCreada = encuestaService.createEncuestaCompleta(encuestaDto);
        return new ResponseEntity<>(encuestaCreada, HttpStatus.CREATED);
    }

    /**
     * URL: GET /api/v1/encuestas/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<EncuestaResponseDto> getEncuestaCompleta(@PathVariable(name = "id") Integer id) {
        EncuestaResponseDto encuestaDto = encuestaService.getEncuestaCompleta(id);
        return ResponseEntity.ok(encuestaDto);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<java.util.List<EncuestaResponseDto>> getAllEncuestas() {
        return ResponseEntity.ok(encuestaService.getAllEncuestas());
    }

    /**
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

    /**
     * solo actualiza el nombre y la version de la encuesta
     * actualizar encuesta URL: PUT /api/v1/encuestas/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EncuestaResponseDto> updateEncuesta(
            @PathVariable Integer id,
            @Valid @RequestBody EncuestaCreateDto encuestaDto) {

        EncuestaResponseDto encuestaActualizada = encuestaService.updateEncuesta(id, encuestaDto);
        return ResponseEntity.ok(encuestaActualizada); // Devuelve 200 OK
    }

    // ---PREGUNTA---

    /**
     * actualizar pregunta URL: PUT /api/v1/encuestas/preguntas/{id}
     */
    @PutMapping("/preguntas/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PreguntaDto> updatePregunta(
            @PathVariable(name = "id") Integer idPregunta,
            @Valid @RequestBody PreguntaCreateDto preguntaDto) {

        PreguntaDto preguntaActualizada = encuestaService.updatePregunta(idPregunta, preguntaDto);
        return ResponseEntity.ok(preguntaActualizada);
    }

    /**
     * añade pregunta a una encuesta URL: POST /api/v1/encuestas/preguntas
     */
    @PostMapping("/{idEncuesta}/preguntas")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<PreguntaDto> addPreguntaToEncuesta(
            @PathVariable(name = "idEncuesta") Integer idEncuesta,
            @Valid @RequestBody PreguntaCreateDto preguntaDto) {
        PreguntaDto nuevaPregunta = encuestaService.addPreguntaToEncuesta(idEncuesta, preguntaDto);
        return new ResponseEntity<>(nuevaPregunta, HttpStatus.CREATED);
    }

    /**
     * Endpoint para GUARDAR las respuestas de una encuesta completada.
     * URL: POST /api/v1/encuestas/registro
     */
    @PostMapping("/registro")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<RegistroResponseDto> saveRegistroEncuesta(
            @Valid @RequestBody RegistroRequestDto registroDto,
            @AuthenticationPrincipal Users user) {
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        RegistroResponseDto respuesta = encuestaService.saveRegistro(registroDto, user);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
        // TODO: Manejar excepciones
    }

    /**
     * elimina una pregunta URL: DELETE /api/v1/encuestas/preguntas/{id}
     */
    @DeleteMapping("/preguntas/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePregunta(
            @PathVariable(name = "id") Integer idPregunta) {
        try {
            encuestaService.deletePregunta(idPregunta);
            return ResponseEntity.noContent().build(); // 204 (Éxito)
        } catch (RuntimeException e) {
            // Captura el "Pregunta no encontrada" del servicio
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

    /**
     * elimina una respuesta URL: DELETE /api/v1/encuestas/respuestas/{id}
     */
    @DeleteMapping("/respuestas/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteRespuesta(
            @PathVariable(name = "id") Integer idRespuesta) {
        try {
            encuestaService.deleteRespuesta(idRespuesta);
            return ResponseEntity.noContent().build(); // 204 No Content (Éxito)
        } catch (RuntimeException e) {
            // Captura el "Respuesta no encontrada"
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

    /**
     * Endpoint (SOLO ADMIN) para EDITAR una respuesta individual de un paciente.
     * URL: PUT /api/v1/encuestas/respuestas/{id}
     */
    @PutMapping("/respuestas/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateRespuesta(
            @PathVariable(name = "id") Integer idRespuesta,
            @RequestBody RespuestaUpdateDto dto) {
        try {
            RespuestaDetalladaDto respuestaActualizada = encuestaService.updateRespuesta(idRespuesta, dto);
            return ResponseEntity.ok(respuestaActualizada); // 200 OK

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // 400 Bad Request

        } catch (RuntimeException e) {
            // Captura "Respuesta no encontrada" o "Opción no encontrada"
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); // 404 Not Found
        }
    }

    /**
     * EXPORTAR ENCUESTA A EXCEL
     * URL: GET /api/v1/encuestas/{id}/export/excel
     */
    @GetMapping("/{id}/export/excel")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<Resource> exportarExcel(
            @PathVariable(name = "id") Integer id,
            @RequestParam(name = "idPaciente", required = false) Integer idPaciente) throws java.io.IOException {
        String filename = "encuesta_" + id + ".xlsx";
        InputStreamResource file = new InputStreamResource(exportService.generateExcel(id, idPaciente));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    /**
     * EXPORTAR ENCUESTA A PDF
     * URL: GET /api/v1/encuestas/{id}/export/pdf
     */
    @GetMapping("/{id}/export/csv")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<Resource> exportarCsv(
            @PathVariable(name = "id") Integer id,
            @RequestParam(name = "idPaciente", required = false) Integer idPaciente) {
        String filename = "encuesta_" + id + ".csv";
        InputStreamResource file = new InputStreamResource(exportService.generateCsv(id, idPaciente));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(file);
    }
}