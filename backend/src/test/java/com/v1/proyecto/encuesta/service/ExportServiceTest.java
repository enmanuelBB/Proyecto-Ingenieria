package com.v1.proyecto.encuesta.service;

import com.v1.proyecto.auth.model.Users;
import com.v1.proyecto.encuesta.model.Encuesta;
import com.v1.proyecto.encuesta.model.Pregunta;
import com.v1.proyecto.encuesta.model.RegistroEncuesta;
import com.v1.proyecto.encuesta.repository.EncuestaRepository;
import com.v1.proyecto.encuesta.repository.RegistroEncuestaRepository;
import com.v1.proyecto.paciente.model.Paciente;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExportServiceTest {

    @Mock
    private EncuestaRepository encuestaRepository;
    @Mock
    private RegistroEncuestaRepository registroEncuestaRepository;

    @InjectMocks
    private ExportService exportService;

    private Encuesta encuesta;
    private RegistroEncuesta registro;

    @BeforeEach
    void setUp() {
        encuesta = Encuesta.builder()
                .idEncuesta(1)
                .titulo("Test Survey")
                .version("1")
                .preguntas(new ArrayList<>())
                .build();

        Pregunta pregunta = Pregunta.builder()
                .idPregunta(1)
                .textoPregunta("Question 1")
                .build();
        encuesta.getPreguntas().add(pregunta);

        Paciente paciente = Paciente.builder()
                .idPaciente(1)
                .nombre("Jane")
                .apellidos("Doe")
                .build();

        Users user = Users.builder()
                .id(1)
                .name("Admin")
                .email("admin@example.com")
                .build();

        registro = RegistroEncuesta.builder()
                .idRegistro(1)
                .paciente(paciente)
                .encuesta(encuesta)
                .usuario(user)
                .fechaRealizacion(LocalDateTime.now())
                .respuestas(new ArrayList<>())
                .build();
    }

    @Test
    void generateExcel_ShouldReturnStream_WhenDataExists() throws IOException {
        when(encuestaRepository.findById(1)).thenReturn(Optional.of(encuesta));
        when(registroEncuestaRepository.findByEncuestaIdEncuesta(1)).thenReturn(Collections.singletonList(registro));

        ByteArrayInputStream result = exportService.generateExcel(1, null, com.v1.proyecto.auth.model.Role.ADMIN);

        assertNotNull(result);
        assertTrue(result.available() > 0);
    }

    @Test
    void generatePdf_ShouldReturnStream_WhenDataExists() {
        when(encuestaRepository.findById(1)).thenReturn(Optional.of(encuesta));
        when(registroEncuestaRepository.findByEncuestaIdEncuesta(1)).thenReturn(Collections.singletonList(registro));

        ByteArrayInputStream result = exportService.generatePdf(1, null, com.v1.proyecto.auth.model.Role.ADMIN);

        assertNotNull(result);
        assertTrue(result.available() > 0);
    }

    @Test
    void generateCsv_ShouldReturnStream_WhenDataExists() {
        when(encuestaRepository.findById(1)).thenReturn(Optional.of(encuesta));
        when(registroEncuestaRepository.findByEncuestaIdEncuesta(1)).thenReturn(Collections.singletonList(registro));

        ByteArrayInputStream result = exportService.generateCsv(1, null, com.v1.proyecto.auth.model.Role.ADMIN);

        assertNotNull(result);
        assertTrue(result.available() > 0);
    }
}
