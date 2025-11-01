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

    // repositorios
    private final EncuestaRepository encuestaRepository;
    private final PacienteRepository pacienteRepository;
    private final PreguntaRepository preguntaRepository;
    private final OpcionRespuestaRepository opcionRespuestaRepository;
    private final RegistroEncuestaRepository registroEncuestaRepository;


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

        // 1. Crear la entidad Encuesta (raíz)
        Encuesta encuesta = Encuesta.builder()
                .titulo(encuestaDto.getTitulo())
                .version(encuestaDto.getVersion())
                .build();

        // 2. Crear las Preguntas y Opciones
        if (encuestaDto.getPreguntas() != null) {
            List<Pregunta> preguntas = encuestaDto.getPreguntas().stream()
                    .map(preguntaDto -> {

                        // 2a. Crear la Pregunta
                        Pregunta pregunta = Pregunta.builder()
                                .textoPregunta(preguntaDto.getTextoPregunta())
                                .tipoPregunta(preguntaDto.getTipoPregunta())
                                .encuesta(encuesta)
                                .build();

                        // 2b. Crear las Opciones para esta Pregunta
                        if (preguntaDto.getOpciones() != null) {
                            List<OpcionRespuesta> opciones = preguntaDto.getOpciones().stream()
                                    .map(opcionDto ->
                                            OpcionRespuesta.builder()
                                                    .textoOpcion(opcionDto.getTextoOpcion())
                                                    .valorDicotomizado(opcionDto.getValorDicotomizado())
                                                    .pregunta(pregunta) // <-- Link de vuelta a la Pregunta
                                                    .build()
                                    ).collect(Collectors.toList());
                            pregunta.setOpciones(opciones);
                        }
                        return pregunta;
                    }).collect(Collectors.toList());

            encuesta.setPreguntas(preguntas);
        }

        // 3. Guardar todo en cascada
        Encuesta encuestaGuardada = encuestaRepository.save(encuesta);

        // 4. Devolver el DTO de respuesta
        return mapEncuestaToDto(encuestaGuardada);
    }

    // --- FUNCIONALIDAD Encuesta 4: AÑADIR PREGUNTA  ---
    @Transactional
    public PreguntaDto addPreguntaToEncuesta(Integer idEncuesta, PreguntaCreateDto preguntaDto) {

        // 1. Encontrar la encuesta "padre"
        Encuesta encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada con id: " + idEncuesta));

        // 2. Crear la nueva Pregunta
        Pregunta pregunta = Pregunta.builder()
                .textoPregunta(preguntaDto.getTextoPregunta())
                .tipoPregunta(preguntaDto.getTipoPregunta())
                .encuesta(encuesta) // <-- ¡El enlace clave!
                .build();

        // 3. Crear las Opciones para esta nueva Pregunta
        if (preguntaDto.getOpciones() != null && !preguntaDto.getOpciones().isEmpty()) {
            List<OpcionRespuesta> opciones = preguntaDto.getOpciones().stream()
                    .map(opcionDto ->
                            OpcionRespuesta.builder()
                                    .textoOpcion(opcionDto.getTextoOpcion())
                                    .valorDicotomizado(opcionDto.getValorDicotomizado())
                                    .pregunta(pregunta) // <-- Link de vuelta a la Pregunta
                                    .build()
                    ).collect(Collectors.toList());

            pregunta.setOpciones(opciones);
        }

        // 4. Guardar la nueva Pregunta
        Pregunta preguntaGuardada = preguntaRepository.save(pregunta);

        // 5. Devolver el DTO de la pregunta recién creada
        return mapPreguntaToDto(preguntaGuardada);
    }

    // --- FUNCIONALIDAD Encuesta 5: EDITAR PREGUNTA  ---

    @Transactional
    public PreguntaDto updatePregunta(Integer idPregunta, PreguntaCreateDto preguntaDto) {

        // 1. Encontrar la pregunta existente
        Pregunta pregunta = preguntaRepository.findById(idPregunta)
                .orElseThrow(() -> new RuntimeException("Pregunta no encontrada con id: " + idPregunta));

        // 2. Actualizar los campos simples
        pregunta.setTextoPregunta(preguntaDto.getTextoPregunta());
        pregunta.setTipoPregunta(preguntaDto.getTipoPregunta());

        // 3. Borrar las opciones antiguas
        pregunta.getOpciones().clear();

        // 4. Crear y añadir las nuevas opciones (si las hay)
        if (preguntaDto.getOpciones() != null) {
            List<OpcionRespuesta> nuevasOpciones = preguntaDto.getOpciones().stream()
                    .map(opcionDto ->
                            OpcionRespuesta.builder()
                                    .textoOpcion(opcionDto.getTextoOpcion())
                                    .valorDicotomizado(opcionDto.getValorDicotomizado())
                                    .pregunta(pregunta) // <-- Link de vuelta a la Pregunta
                                    .build()
                    ).collect(Collectors.toList());

            pregunta.getOpciones().addAll(nuevasOpciones);
        }

        // 5. Guardar la pregunta actualizada (guardará las opciones en cascada)
        Pregunta preguntaGuardada = preguntaRepository.save(pregunta);

        // 6. Devolver el DTO de la pregunta actualizada
        return mapPreguntaToDto(preguntaGuardada);
    }

    // --- FUNCIONALIDAD Encuesta 6: EDITAR TITULO Y VERSION ENCUESTA  ---
    @Transactional
    public EncuestaResponseDto updateEncuesta(Integer id, EncuestaCreateDto encuestaDto) {
        // 1. Busca la encuesta que vamos a editar
        Encuesta encuestaExistente = encuestaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada con id: " + id));

        // 2. Actualiza los campos "simples" (título y versión)
        encuestaExistente.setTitulo(encuestaDto.getTitulo());
        encuestaExistente.setVersion(encuestaDto.getVersion());

        // 3. Guarda los cambios
        Encuesta encuestaGuardada = encuestaRepository.save(encuestaExistente);

        // 4. Devuelve el DTO actualizado
        return mapEncuestaToDto(encuestaGuardada);
    }

    // --- FUNCIONALIDAD Encuesta 7: ELIMINAR PREGUNTA  ---
    @Transactional
    public void deletePregunta(Integer idPregunta) {

        // 1. Verifica que la pregunta existe antes de borrarla
        if (!preguntaRepository.existsById(idPregunta)) {
            throw new RuntimeException("Pregunta no encontrada con id: " + idPregunta);
        }

        // 2. Borra la pregunta.
        // Gracias a CascadeType.ALL en la entidad Pregunta,
        // esto borrará automáticamente todas las OpcionRespuesta asociadas.
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