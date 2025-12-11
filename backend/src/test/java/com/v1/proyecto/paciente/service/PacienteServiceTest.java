package com.v1.proyecto.paciente.service;

import com.v1.proyecto.paciente.dto.PacienteRequestDto;
import com.v1.proyecto.paciente.dto.PacienteResponseDto;
import com.v1.proyecto.paciente.model.Paciente;
import com.v1.proyecto.paciente.repository.PacienteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PacienteServiceTest {

    @Mock
    private PacienteRepository pacienteRepository;

    @InjectMocks
    private PacienteService pacienteService;

    private Paciente paciente;
    private PacienteRequestDto requestDto;

    @BeforeEach
    void setUp() {
        paciente = Paciente.builder()
                .idPaciente(1)
                .rut("12345678-9")
                .nombre("John")
                .apellidos("Doe")
                .email("john@example.com")
                .build();

        requestDto = new PacienteRequestDto();
        requestDto.setRut("12345678-9");
        requestDto.setNombre("John");
        requestDto.setApellidos("Doe");
        requestDto.setEmail("john@example.com");
    }

    @Test
    void findAllPacientes_ShouldReturnList() {
        when(pacienteRepository.findAll()).thenReturn(Arrays.asList(paciente));

        List<PacienteResponseDto> result = pacienteService.findAllPacientes();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John", result.get(0).getNombre());
    }

    @Test
    void findPacienteById_ShouldReturnDto_WhenExists() {
        when(pacienteRepository.findById(1)).thenReturn(Optional.of(paciente));

        Optional<PacienteResponseDto> result = pacienteService.findPacienteById(1);

        assertTrue(result.isPresent());
        assertEquals("John", result.get().getNombre());
    }

    @Test
    void savePaciente_ShouldSaveAndReturnDto_WhenRutIsNew() {
        when(pacienteRepository.findByRut("12345678-9")).thenReturn(Optional.empty());
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(paciente);

        PacienteResponseDto result = pacienteService.savePaciente(requestDto);

        assertNotNull(result);
        assertEquals("John", result.getNombre());
        verify(pacienteRepository).save(any(Paciente.class));
    }

    @Test
    void savePaciente_ShouldThrowException_WhenRutExists() {
        when(pacienteRepository.findByRut("12345678-9")).thenReturn(Optional.of(paciente));

        assertThrows(IllegalStateException.class, () -> pacienteService.savePaciente(requestDto));
    }

    @Test
    void updatePaciente_ShouldUpdateAndReturnDto_WhenExists() {
        when(pacienteRepository.findById(1)).thenReturn(Optional.of(paciente));
        when(pacienteRepository.save(any(Paciente.class))).thenReturn(paciente);

        Optional<PacienteResponseDto> result = pacienteService.updatePaciente(1, requestDto);

        assertTrue(result.isPresent());
        assertEquals("John", result.get().getNombre());
    }

    @Test
    void deletePaciente_ShouldDelete() {
        pacienteService.deletePaciente(1);
        verify(pacienteRepository).deleteById(1);
    }

    @Test
    void findPacienteByRut_ShouldReturnDto_WhenExists() {
        when(pacienteRepository.findByRut("12345678-9")).thenReturn(Optional.of(paciente));

        Optional<PacienteResponseDto> result = pacienteService.findPacienteByRut("12345678-9");

        assertTrue(result.isPresent());
        assertEquals("John", result.get().getNombre());
    }
}
