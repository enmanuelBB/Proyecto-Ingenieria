package com.v1.proyecto.encuesta.service;

import com.v1.proyecto.auth.model.Users;
import com.v1.proyecto.encuesta.dto.*;
import com.v1.proyecto.encuesta.model.*;
import com.v1.proyecto.encuesta.repository.*;
import com.v1.proyecto.paciente.model.Paciente;
import com.v1.proyecto.paciente.repository.PacienteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EncuestaServiceTest {

    @Mock
    private EncuestaRepository encuestaRepository;
    @Mock
    private PacienteRepository pacienteRepository;
    @Mock
    private PreguntaRepository preguntaRepository;
    @Mock
    private OpcionRespuestaRepository opcionRespuestaRepository;
    @Mock
    private RegistroEncuestaRepository registroEncuestaRepository;
    @Mock
    private LogicaSaltoRepository logicaSaltoRepository;
    @Mock
    private RespuestaRepository respuestaRepository;

    @InjectMocks
    private EncuestaService encuestaService;

    private Encuesta encuesta;
    private Paciente paciente;
    private Users user;
    private Pregunta pregunta;
    private OpcionRespuesta opcion;

    @BeforeEach
    void setUp() {
        encuesta = Encuesta.builder()
                .idEncuesta(1)
                .titulo("Test Survey")
                .version("1")
                .preguntas(new ArrayList<>())
                .build();

        paciente = Paciente.builder()
                .idPaciente(1)
                .nombre("Jane")
                .apellidos("Doe")
                .build();

        user = Users.builder()
                .id(1)
                .name("Admin")
                .build();

        pregunta = Pregunta.builder()
                .idPregunta(1)
                .textoPregunta("Question 1")
                .tipoPregunta("SELECCION_UNICA")
                .obligatoria(true)
                .encuesta(encuesta)
                .opciones(new ArrayList<>())
                .build();

        encuesta.getPreguntas().add(pregunta);

        opcion = OpcionRespuesta.builder()
                .idOpcion(1)
                .textoOpcion("Option A")
                .pregunta(pregunta)
                .build();

        pregunta.getOpciones().add(opcion);
    }

    @Test
    void getEncuestaCompleta_ShouldReturnDto_WhenExists() {
        when(encuestaRepository.findById(1)).thenReturn(Optional.of(encuesta));

        EncuestaResponseDto result = encuestaService.getEncuestaCompleta(1);

        assertNotNull(result);
        assertEquals("Test Survey", result.getTitulo());
        assertEquals(1, result.getPreguntas().size());
    }

    @Test
    void getEncuestaCompleta_ShouldThrowException_WhenNotExists() {
        when(encuestaRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> encuestaService.getEncuestaCompleta(1));
    }

    @Test
    void saveRegistro_ShouldSaveAndReturnDto_WhenValid() {
        RegistroRequestDto request = new RegistroRequestDto();
        request.setIdPaciente(1);
        request.setIdEncuesta(1);

        RespuestaRequestDto respuestaDto = new RespuestaRequestDto();
        respuestaDto.setIdPregunta(1);
        respuestaDto.setIdOpcionSeleccionada(1);

        request.setRespuestas(Collections.singletonList(respuestaDto));

        when(pacienteRepository.findById(1)).thenReturn(Optional.of(paciente));
        when(encuestaRepository.findById(1)).thenReturn(Optional.of(encuesta));
        when(preguntaRepository.findById(1)).thenReturn(Optional.of(pregunta));
        when(opcionRespuestaRepository.findById(1)).thenReturn(Optional.of(opcion));

        RegistroEncuesta registroGuardado = RegistroEncuesta.builder()
                .idRegistro(1)
                .paciente(paciente)
                .encuesta(encuesta)
                .usuario(user)
                .fechaRealizacion(LocalDateTime.now())
                .respuestas(new ArrayList<>())
                .build();

        when(registroEncuestaRepository.save(any(RegistroEncuesta.class))).thenReturn(registroGuardado);

        RegistroResponseDto result = encuestaService.saveRegistro(request, user);

        assertNotNull(result);
        verify(registroEncuestaRepository).save(any(RegistroEncuesta.class));
    }

    @Test
    void saveRegistro_ShouldThrowException_WhenMandatoryQuestionMissing() {
        RegistroRequestDto request = new RegistroRequestDto();
        request.setIdPaciente(1);
        request.setIdEncuesta(1);
        request.setRespuestas(Collections.emptyList()); // No answers

        when(pacienteRepository.findById(1)).thenReturn(Optional.of(paciente));
        when(encuestaRepository.findById(1)).thenReturn(Optional.of(encuesta));

        assertThrows(IllegalArgumentException.class, () -> encuestaService.saveRegistro(request, user));
    }

    @Test
    void createEncuestaCompleta_ShouldSaveAndReturnDto() {
        EncuestaCreateDto dto = new EncuestaCreateDto();
        dto.setTitulo("New Survey");
        dto.setVersion("1");
        dto.setPreguntas(new ArrayList<>());

        when(encuestaRepository.save(any(Encuesta.class))).thenAnswer(invocation -> {
            Encuesta e = invocation.getArgument(0);
            e.setIdEncuesta(2);
            return e;
        });

        EncuestaResponseDto result = encuestaService.createEncuestaCompleta(dto);

        assertNotNull(result);
        assertEquals("New Survey", result.getTitulo());
        verify(encuestaRepository).save(any(Encuesta.class));
    }

    @Test
    void addPreguntaToEncuesta_ShouldAddAndReturnDto() {
        PreguntaCreateDto dto = new PreguntaCreateDto();
        dto.setTextoPregunta("New Question");
        dto.setTipoPregunta("TEXTO_LIBRE");
        dto.setObligatoria(false);

        when(encuestaRepository.findById(1)).thenReturn(Optional.of(encuesta));
        when(preguntaRepository.save(any(Pregunta.class))).thenAnswer(invocation -> {
            Pregunta p = invocation.getArgument(0);
            p.setIdPregunta(2);
            return p;
        });

        PreguntaDto result = encuestaService.addPreguntaToEncuesta(1, dto);

        assertNotNull(result);
        assertEquals("New Question", result.getTextoPregunta());
    }

    @Test
    void deleteEncuesta_ShouldDelete_WhenExists() {
        when(encuestaRepository.existsById(1)).thenReturn(true);

        encuestaService.deleteEncuesta(1);

        verify(encuestaRepository).deleteById(1);
    }

    @Test
    void deleteEncuesta_ShouldThrowException_WhenNotExists() {
        when(encuestaRepository.existsById(1)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> encuestaService.deleteEncuesta(1));
    }
}
