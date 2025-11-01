package com.v1.proyecto.encuesta.service;

import com.v1.proyecto.auth.model.Users;
import com.v1.proyecto.encuesta.dto.*;
import com.v1.proyecto.encuesta.model.*;
import com.v1.proyecto.encuesta.repository.*;
import com.v1.proyecto.paciente.model.Paciente;
import com.v1.proyecto.paciente.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EncuestaService {

    // Necesitamos todos estos repositorios
    private final EncuestaRepository encuestaRepository;
    private final PacienteRepository pacienteRepository;
    private final PreguntaRepository preguntaRepository;
    private final OpcionRespuestaRepository opcionRespuestaRepository;
    private final RegistroEncuestaRepository registroEncuestaRepository;

    // --- FUNCIONALIDAD 1: OBTENER FORMULARIO (GET) ---

    @Transactional(readOnly = true)
    public EncuestaResponseDto getEncuestaCompleta(Integer id) {
        Encuesta encuesta = encuestaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada con id: " + id));
        
        return mapEncuestaToDto(encuesta);
    }

    // --- FUNCIONALIDAD 2: GUARDAR FORMULARIO (POST) ---

    @Transactional
    public RegistroResponseDto saveRegistro(RegistroRequestDto registroDto, Users user) {

        Paciente paciente = pacienteRepository.findById(registroDto.getIdPaciente())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        Encuesta encuesta = encuestaRepository.findById(registroDto.getIdEncuesta())
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));

        RegistroEncuesta registro = RegistroEncuesta.builder()
                .paciente(paciente)
                .encuesta(encuesta)
                .usuario(user)
                .fechaRealizacion(LocalDateTime.now())
                .respuestas(new ArrayList<>())
                .build();

        for (RespuestaRequestDto resDto : registroDto.getRespuestas()) {
            Pregunta pregunta = preguntaRepository.findById(resDto.getIdPregunta())
                    .orElseThrow(() -> new RuntimeException("Pregunta no encontrada"));
            
            OpcionRespuesta opcion = null;
            if (resDto.getIdOpcionSeleccionada() != null) {
                opcion = opcionRespuestaRepository.findById(resDto.getIdOpcionSeleccionada())
                        .orElseThrow(() -> new RuntimeException("Opción no encontrada"));
            }

            Respuesta respuesta = Respuesta.builder()
                    .registroEncuesta(registro)
                    .pregunta(pregunta)
                    .opcionSeleccionada(opcion)
                    .valorTexto(resDto.getValorTexto())
                    .build();
            
            registro.getRespuestas().add(respuesta);
        }

        RegistroEncuesta registroGuardado = registroEncuestaRepository.save(registro);
        return mapRegistroToDto(registroGuardado);
    }


    // --- MÉTODOS PRIVADOS DE MAPEO (DTOs) ---

    private EncuestaResponseDto mapEncuestaToDto(Encuesta encuesta) {
        return EncuestaResponseDto.builder()
                .idEncuesta(encuesta.getIdEncuesta())
                .titulo(encuesta.getTitulo())
                .preguntas(encuesta.getPreguntas().stream()
                        .map(this::mapPreguntaToDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private PreguntaDto mapPreguntaToDto(Pregunta pregunta) {
        return PreguntaDto.builder()
                .idPregunta(pregunta.getIdPregunta())
                .textoPregunta(pregunta.getTextoPregunta())
                .tipoPregunta(pregunta.getTipoPregunta())
                .opciones(pregunta.getOpciones().stream()
                        .map(this::mapOpcionToDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private OpcionRespuestaDto mapOpcionToDto(OpcionRespuesta opcion) {
        return OpcionRespuestaDto.builder()
                .idOpcion(opcion.getIdOpcion())
                .textoOpcion(opcion.getTextoOpcion())
                .build();
    }

    private RegistroResponseDto mapRegistroToDto(RegistroEncuesta registro) {
        return RegistroResponseDto.builder()
                .idRegistro(registro.getIdRegistro())
                .idPaciente(registro.getPaciente().getIdPaciente())
                .fechaRealizacion(registro.getFechaRealizacion())
                .usuarioNombre(registro.getUsuario().getUsername())
                .build();
    }
}