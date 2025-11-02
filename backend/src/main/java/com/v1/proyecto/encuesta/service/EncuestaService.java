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
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EncuestaService {

    // repositorios
    private final EncuestaRepository encuestaRepository;
    private final PacienteRepository pacienteRepository;
    private final PreguntaRepository preguntaRepository;
    private final OpcionRespuestaRepository opcionRespuestaRepository;
    private final RegistroEncuestaRepository registroEncuestaRepository;
    private final LogicaSaltoRepository logicaSaltoRepository;

    // --- FUNCIONALIDAD Encuesta 1: OBTENER FORMULARIO (GET) ---

    @Transactional(readOnly = true)
    public EncuestaResponseDto getEncuestaCompleta(Integer id) {
        Encuesta encuesta = encuestaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada con id: " + id));

        return mapEncuestaToDto(encuesta);
    }

    // --- FUNCIONALIDAD Encuesta 2: GUARDAR FORMULARIO (POST) ---

    @Transactional
    public RegistroResponseDto saveRegistro(RegistroRequestDto registroDto, Users user) {

        Paciente paciente = pacienteRepository.findById(registroDto.getIdPaciente())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        Encuesta encuesta = encuestaRepository.findById(registroDto.getIdEncuesta())
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));

        // --- INICIO DE LA VALIDACIÓN DE PREGUNTAS OBLIGATORIAS ---

        // 1. Obtiene todas las preguntas obligatorias de esta encuesta
        Set<Integer> preguntasObligatoriasIds = encuesta.getPreguntas().stream()
                .filter(Pregunta::isObligatoria)
                .map(Pregunta::getIdPregunta)
                .collect(Collectors.toSet());

        // 2. Obtiene los IDs de las preguntas que el usuario SÍ respondió
        Set<Integer> preguntasRespondidasIds = registroDto.getRespuestas().stream()
                .map(RespuestaRequestDto::getIdPregunta)
                .collect(Collectors.toSet());

        // 3. Comprueba si faltan obligatorias
        for (Integer idObligatoria : preguntasObligatoriasIds) {
            if (!preguntasRespondidasIds.contains(idObligatoria)) {
                // (En un escenario real, también deberías chequear la lógica de salto aquí)
                throw new IllegalArgumentException("Respuesta faltante para la pregunta obligatoria ID: " + idObligatoria);
            }
        }
        // --- FIN DE LA VALIDACIÓN ---

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

    // --- FUNCIONALIDAD Encuesta 3: CREAR Encuesta (POST) ---
    @Transactional
    public EncuestaResponseDto createEncuestaCompleta(EncuestaCreateDto encuestaDto) {

        Encuesta encuesta = Encuesta.builder()
                .titulo(encuestaDto.getTitulo())
                .version(encuestaDto.getVersion())
                .build();

        if (encuestaDto.getPreguntas() != null) {
            List<Pregunta> preguntas = encuestaDto.getPreguntas().stream()
                    .map(preguntaDto -> {

                        Pregunta pregunta = Pregunta.builder()
                                .textoPregunta(preguntaDto.getTextoPregunta())
                                .tipoPregunta(preguntaDto.getTipoPregunta())
                                .obligatoria(preguntaDto.isObligatoria())
                                .encuesta(encuesta)
                                .build();

                        if (preguntaDto.getOpciones() != null) {
                            List<OpcionRespuesta> opciones = preguntaDto.getOpciones().stream()
                                    .map(opcionDto ->
                                            OpcionRespuesta.builder()
                                                    .textoOpcion(opcionDto.getTextoOpcion())
                                                    .valorDicotomizado(opcionDto.getValorDicotomizado())
                                                    .pregunta(pregunta)
                                                    .build()
                                    ).collect(Collectors.toList());
                            pregunta.setOpciones(opciones);
                        }
                        return pregunta;
                    }).collect(Collectors.toList());
            encuesta.setPreguntas(preguntas);
        }
        Encuesta encuestaGuardada = encuestaRepository.save(encuesta);
        return mapEncuestaToDto(encuestaGuardada);
    }

    // --- FUNCIONALIDAD Encuesta 4: AÑADIR PREGUNTA ---
    @Transactional
    public PreguntaDto addPreguntaToEncuesta(Integer idEncuesta, PreguntaCreateDto preguntaDto) {

        Encuesta encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada con id: " + idEncuesta));

        Pregunta pregunta = Pregunta.builder()
                .textoPregunta(preguntaDto.getTextoPregunta())
                .tipoPregunta(preguntaDto.getTipoPregunta())
                .obligatoria(preguntaDto.isObligatoria())
                .encuesta(encuesta)
                .build();

        if (preguntaDto.getOpciones() != null && !preguntaDto.getOpciones().isEmpty()) {
            List<OpcionRespuesta> opciones = preguntaDto.getOpciones().stream()
                    .map(opcionDto ->
                            OpcionRespuesta.builder()
                                    .textoOpcion(opcionDto.getTextoOpcion())
                                    .valorDicotomizado(opcionDto.getValorDicotomizado())
                                    .pregunta(pregunta)
                                    .build()
                    ).collect(Collectors.toList());
            pregunta.setOpciones(opciones);
        }
        Pregunta preguntaGuardada = preguntaRepository.save(pregunta);
        return mapPreguntaToDto(preguntaGuardada);
    }

    // --- FUNCIONALIDAD Encuesta 5: EDITAR PREGUNTA ---
    @Transactional
    public PreguntaDto updatePregunta(Integer idPregunta, PreguntaCreateDto preguntaDto) {

        Pregunta pregunta = preguntaRepository.findById(idPregunta)
                .orElseThrow(() -> new RuntimeException("Pregunta no encontrada con id: " + idPregunta));

        pregunta.setTextoPregunta(preguntaDto.getTextoPregunta());
        pregunta.setTipoPregunta(preguntaDto.getTipoPregunta());
        pregunta.setObligatoria(preguntaDto.isObligatoria());

        pregunta.getOpciones().clear();

        if (preguntaDto.getOpciones() != null) {
            List<OpcionRespuesta> nuevasOpciones = preguntaDto.getOpciones().stream()
                    .map(opcionDto ->
                            OpcionRespuesta.builder()
                                    .textoOpcion(opcionDto.getTextoOpcion())
                                    .valorDicotomizado(opcionDto.getValorDicotomizado())
                                    .pregunta(pregunta)
                                    .build()
                    ).collect(Collectors.toList());
            pregunta.getOpciones().addAll(nuevasOpciones);
        }
        Pregunta preguntaGuardada = preguntaRepository.save(pregunta);
        return mapPreguntaToDto(preguntaGuardada);
    }

    // --- FUNCIONALIDAD Encuesta 6: EDITAR TITULO Y VERSION ENCUESTA ---
    @Transactional
    public EncuestaResponseDto updateEncuesta(Integer id, EncuestaCreateDto encuestaDto) {
        Encuesta encuestaExistente = encuestaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada con id: " + id));
        encuestaExistente.setTitulo(encuestaDto.getTitulo());
        encuestaExistente.setVersion(encuestaDto.getVersion());
        Encuesta encuestaGuardada = encuestaRepository.save(encuestaExistente);
        return mapEncuestaToDto(encuestaGuardada);
    }

    // --- FUNCIONALIDAD Encuesta 7: ELIMINAR PREGUNTA ---
    @Transactional
    public void deletePregunta(Integer idPregunta) {
        if (!preguntaRepository.existsById(idPregunta)) {
            throw new RuntimeException("Pregunta no encontrada con id: " + idPregunta);
        }
        preguntaRepository.deleteById(idPregunta);
    }

    // --- FUNCIONALIDAD Encuesta 8: ELIMINAR ENCUESTA ---
    @Transactional
    public void deleteEncuesta(Integer id) {
        if (!encuestaRepository.existsById(id)) {
            throw new RuntimeException("Encuesta no encontrada con id: " + id);
        }
        encuestaRepository.deleteById(id);
    }


    // --- MÉTODOS PRIVADOS DE MAPEO (DTOs) ---
    // (Actualizados para enviar 'obligatoria' y 'logicaSalto' al frontend)

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
                .obligatoria(pregunta.isObligatoria())
                .opciones(pregunta.getOpciones().stream()
                        .map(this::mapOpcionToDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private OpcionRespuestaDto mapOpcionToDto(OpcionRespuesta opcion) {
        // Busca si esta opción dispara una lógica de salto
        LogicaSalto logica = logicaSaltoRepository.findByOpcionOrigen(opcion).orElse(null);
        Integer idPreguntaDestino = (logica != null) ? logica.getPreguntaDestino().getIdPregunta() : null;

        return OpcionRespuestaDto.builder()
                .idOpcion(opcion.getIdOpcion())
                .textoOpcion(opcion.getTextoOpcion())
                .idPreguntaDestino(idPreguntaDestino)
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