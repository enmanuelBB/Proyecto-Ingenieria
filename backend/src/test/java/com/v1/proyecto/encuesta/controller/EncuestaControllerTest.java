package com.v1.proyecto.encuesta.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.v1.proyecto.encuesta.dto.*;
import com.v1.proyecto.encuesta.service.EncuestaService;
import com.v1.proyecto.encuesta.service.ExportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.ByteArrayInputStream;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class EncuestaControllerTest {

        @Mock
        private EncuestaService encuestaService;
        @Mock
        private ExportService exportService;

        @InjectMocks
        private EncuestaController encuestaController;

        private MockMvc mockMvc;
        private ObjectMapper objectMapper;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.standaloneSetup(encuestaController).build();
                objectMapper = new ObjectMapper();
        }

        @Test
        void createEncuesta_ShouldReturnCreated() throws Exception {
                EncuestaCreateDto dto = new EncuestaCreateDto();
                dto.setTitulo("New Survey");
                dto.setVersion("1");

                EncuestaResponseDto response = EncuestaResponseDto.builder()
                                .idEncuesta(1)
                                .titulo("New Survey")
                                .build();

                when(encuestaService.createEncuestaCompleta(any(EncuestaCreateDto.class))).thenReturn(response);

                mockMvc.perform(post("/api/v1/encuestas")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isCreated());
        }

        @Test
        void getEncuestaCompleta_ShouldReturnOk() throws Exception {
                EncuestaResponseDto response = EncuestaResponseDto.builder()
                                .idEncuesta(1)
                                .titulo("Survey")
                                .build();

                when(encuestaService.getEncuestaCompleta(1)).thenReturn(response);

                mockMvc.perform(get("/api/v1/encuestas/1"))
                                .andExpect(status().isOk());
        }

        @Test
        void deleteEncuesta_ShouldReturnNoContent() throws Exception {
                mockMvc.perform(delete("/api/v1/encuestas/1"))
                                .andExpect(status().isNoContent());
        }

        @Test
        void updateEncuesta_ShouldReturnOk() throws Exception {
                EncuestaCreateDto dto = new EncuestaCreateDto();
                dto.setTitulo("Updated Survey");
                dto.setVersion("2");

                EncuestaResponseDto response = EncuestaResponseDto.builder()
                                .idEncuesta(1)
                                .titulo("Updated Survey")
                                .build();

                when(encuestaService.updateEncuesta(eq(1), any(EncuestaCreateDto.class))).thenReturn(response);

                mockMvc.perform(put("/api/v1/encuestas/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk());
        }

        @Test
        void exportarExcel_ShouldReturnOk() throws Exception {
                when(exportService.generateExcel(1)).thenReturn(new ByteArrayInputStream(new byte[0]));

                mockMvc.perform(get("/api/v1/encuestas/1/export/excel"))
                                .andExpect(status().isOk());
        }

        @Test
        void exportarPdf_ShouldReturnOk() throws Exception {
                when(exportService.generatePdf(1)).thenReturn(new ByteArrayInputStream(new byte[0]));

                mockMvc.perform(get("/api/v1/encuestas/1/export/pdf"))
                                .andExpect(status().isOk());
        }

        @Test
        void exportarCsv_ShouldReturnOk() throws Exception {
                when(exportService.generateCsv(1)).thenReturn(new ByteArrayInputStream(new byte[0]));

                mockMvc.perform(get("/api/v1/encuestas/1/export/csv"))
                                .andExpect(status().isOk());
        }
}
