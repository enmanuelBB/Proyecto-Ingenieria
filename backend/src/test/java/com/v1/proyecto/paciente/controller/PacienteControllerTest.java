package com.v1.proyecto.paciente.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.v1.proyecto.encuesta.dto.RegistroCompletoResponseDto;
import com.v1.proyecto.encuesta.service.EncuestaService;
import com.v1.proyecto.paciente.dto.PacienteRequestDto;
import com.v1.proyecto.paciente.dto.PacienteResponseDto;
import com.v1.proyecto.paciente.service.PacienteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PacienteControllerTest {

        @Mock
        private PacienteService pacienteService;
        @Mock
        private EncuestaService encuestaService;

        @InjectMocks
        private PacienteController pacienteController;

        private MockMvc mockMvc;
        private ObjectMapper objectMapper;
        private PacienteResponseDto responseDto;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.standaloneSetup(pacienteController).build();
                objectMapper = new ObjectMapper();

                responseDto = PacienteResponseDto.builder()
                                .idPaciente(1)
                                .rut("12345678-9")
                                .nombre("John")
                                .apellidos("Doe")
                                .build();
        }

        @Test
        void createPaciente_ShouldReturnCreated() throws Exception {
                PacienteRequestDto request = new PacienteRequestDto();
                request.setRut("12345678-9");
                request.setNombre("John");
                request.setApellidos("Doe");
                request.setGrupo("Caso");
                request.setFechaInclusion(new java.util.Date());
                request.setFechaNacimiento(new java.util.Date(1000000000L)); // Past date
                request.setSexo("Masculino");
                request.setPeso(70.0);
                request.setEstatura(1.75);

                when(pacienteService.savePaciente(any(PacienteRequestDto.class))).thenReturn(responseDto);

                mockMvc.perform(post("/api/v1/pacientes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.rut").value("12345678-9"));
        }

        @Test
        void getAllPacientes_ShouldReturnOk() throws Exception {
                when(pacienteService.findAllPacientes()).thenReturn(Arrays.asList(responseDto));

                mockMvc.perform(get("/api/v1/pacientes"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].rut").value("12345678-9"));
        }

        @Test
        void getPacienteById_ShouldReturnOk_WhenExists() throws Exception {
                when(pacienteService.findPacienteById(1)).thenReturn(Optional.of(responseDto));

                mockMvc.perform(get("/api/v1/pacientes/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.rut").value("12345678-9"));
        }

        @Test
        void updatePaciente_ShouldReturnOk_WhenExists() throws Exception {
                PacienteRequestDto request = new PacienteRequestDto();
                request.setNombre("John Updated");
                request.setRut("12345678-9"); // Required
                request.setApellidos("Doe"); // Required
                request.setGrupo("Caso"); // Required
                request.setFechaInclusion(new java.util.Date()); // Required
                request.setFechaNacimiento(new java.util.Date(1000000000L)); // Required
                request.setSexo("Masculino"); // Required
                request.setPeso(70.0); // Required
                request.setEstatura(1.75); // Required

                PacienteResponseDto updatedResponse = PacienteResponseDto.builder()
                                .idPaciente(1)
                                .nombre("John Updated")
                                .build();

                when(pacienteService.updatePaciente(eq(1), any(PacienteRequestDto.class)))
                                .thenReturn(Optional.of(updatedResponse));

                mockMvc.perform(put("/api/v1/pacientes/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.nombre").value("John Updated"));
        }

        @Test
        void getPacienteByRut_ShouldReturnOk_WhenExists() throws Exception {
                when(pacienteService.findPacienteByRut("12345678-9")).thenReturn(Optional.of(responseDto));

                mockMvc.perform(get("/api/v1/pacientes/rut/12345678-9"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.rut").value("12345678-9"));
        }

        @Test
        void getRegistrosDelPaciente_ShouldReturnOk() throws Exception {
                RegistroCompletoResponseDto registro = RegistroCompletoResponseDto.builder()
                                .idRegistro(1)
                                .build();

                when(encuestaService.getRegistrosPorPaciente(1)).thenReturn(Collections.singletonList(registro));

                mockMvc.perform(get("/api/v1/pacientes/1/registros"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].idRegistro").value(1));
        }

        @Test
        void deletePaciente_ShouldReturnNoContent_WhenExists() throws Exception {
                when(pacienteService.findPacienteById(1)).thenReturn(Optional.of(responseDto));

                mockMvc.perform(delete("/api/v1/pacientes/1"))
                                .andExpect(status().isNoContent());
        }
}
