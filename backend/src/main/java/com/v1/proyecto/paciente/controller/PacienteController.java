package com.v1.proyecto.paciente.controller;

import com.v1.proyecto.paciente.dto.PacienteRequestDto;
import com.v1.proyecto.paciente.dto.PacienteResponseDto;
import com.v1.proyecto.paciente.model.Paciente;
import com.v1.proyecto.paciente.service.PacienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pacientes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
public class PacienteController {

    private final PacienteService pacienteService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<?> createPaciente(@Valid @RequestBody PacienteRequestDto pacienteDto) {
        try {
            // El servicio ahora recibe el DTO y devuelve un DTO
            PacienteResponseDto nuevoPaciente = pacienteService.savePaciente(pacienteDto);
            return new ResponseEntity<>(nuevoPaciente, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<List<PacienteResponseDto>> getAllPacientes() {
        // El servicio ya devuelve una lista de DTOs
        List<PacienteResponseDto> pacientes = pacienteService.findAllPacientes();
        return ResponseEntity.ok(pacientes);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<PacienteResponseDto> getPacienteById(@PathVariable(name = "id") Integer id) {
        // El servicio ya devuelve un Optional<DTO>
        return pacienteService.findPacienteById(id)
                .map(pacienteDto -> ResponseEntity.ok(pacienteDto))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<PacienteResponseDto> updatePaciente(@PathVariable(name = "id") Integer id, @Valid @RequestBody PacienteRequestDto pacienteDto) {
        return pacienteService.updatePaciente(id, pacienteDto)
                .map(pacienteActualizado -> ResponseEntity.ok(pacienteActualizado))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/rut/{rut}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<PacienteResponseDto> getPacienteByRut(@PathVariable(name = "rut") String rut) {
        return pacienteService.findPacienteByRut(rut)
                .map(pacienteDto -> ResponseEntity.ok(pacienteDto)) // Devuelve 200 OK
                .orElse(ResponseEntity.notFound().build()); // Devuelve 404 Not Found
    }

    /**
     * Endpoint para eliminar un paciente.
     * URL: DELETE /api/v1/pacientes/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePaciente(@PathVariable(name = "id") Integer id) {
        // Primero verifica si el paciente existe
        if (pacienteService.findPacienteById(id).isPresent()) {
            pacienteService.deletePaciente(id);
            return ResponseEntity.noContent().build(); // Devuelve 204 exito
        } else {
            return ResponseEntity.notFound().build(); // Devuelve 404 si no existe
        }
    }
}
