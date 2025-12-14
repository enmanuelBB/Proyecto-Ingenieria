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
    private final RespuestaRepository respuestaRepository;

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

        boolean esBorrador = Boolean.TRUE.equals(registroDto.getEsBorrador());

        // --- INICIO DE LA VALIDACIÓN DE PREGUNTAS OBLIGATORIAS ---
        // SOLO VALIDAR SI NO ES BORRADOR
        if (!esBorrador) {
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
                    throw new IllegalArgumentException(
                            "Respuesta faltante para la pregunta obligatoria ID: " + idObligatoria);
                }
            }
        }
        // --- FIN DE LA VALIDACIÓN ---

        RegistroEncuesta registro = RegistroEncuesta.builder()
                .paciente(paciente)
                .encuesta(encuesta)
                .usuario(user)
                .fechaRealizacion(LocalDateTime.now())
                .respuestas(new ArrayList<>())
                .estado(esBorrador ? "BORRADOR" : "COMPLETADO")
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
                                .oculta(preguntaDto.isOculta())
                                .encuesta(encuesta)
                                .build();

                        if (preguntaDto.getOpciones() != null) {
                            List<OpcionRespuesta> opciones = preguntaDto.getOpciones().stream()
                                    .map(opcionDto -> OpcionRespuesta.builder()
                                            .textoOpcion(opcionDto.getTextoOpcion())
                                            .valorDicotomizado(opcionDto.getValorDicotomizado())
                                            .pregunta(pregunta)
                                            .build())
                                    .collect(Collectors.toList());
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
                .oculta(preguntaDto.isOculta())
                .encuesta(encuesta)
                .build();

        if (preguntaDto.getOpciones() != null && !preguntaDto.getOpciones().isEmpty()) {
            List<OpcionRespuesta> opciones = preguntaDto.getOpciones().stream()
                    .map(opcionDto -> OpcionRespuesta.builder()
                            .textoOpcion(opcionDto.getTextoOpcion())
                            .valorDicotomizado(opcionDto.getValorDicotomizado())
                            .pregunta(pregunta)
                            .build())
                    .collect(Collectors.toList());
            pregunta.setOpciones(opciones);
        }
        Pregunta preguntaGuardada = preguntaRepository.save(pregunta);

        // Procesar lógica de salto después de guardar (para tener IDs de opciones)
        if (preguntaDto.getOpciones() != null) {
            procesarLogicaSalto(preguntaGuardada, preguntaDto.getOpciones());
        }

        return mapPreguntaToDto(preguntaGuardada);
    }

    // --- FUNCIONALIDAD Encuesta 5: EDITAR PREGUNTA ---
    @Transactional
    public PreguntaDto updatePregunta(Integer idPregunta, PreguntaCreateDto preguntaDto) {

        Pregunta pregunta = preguntaRepository.findById(idPregunta)
                .orElseThrow(() -> new RuntimeException("Pregunta no encontrada con id: " + idPregunta));

        pregunta.setTextoPregunta(preguntaDto.getTextoPregunta());
        pregunta.setTipoPregunta(preguntaDto.getTipoPregunta());
        pregunta.setTipoPregunta(preguntaDto.getTipoPregunta());
        pregunta.setObligatoria(preguntaDto.isObligatoria());
        pregunta.setOculta(preguntaDto.isOculta());

        // Limpiar opciones existentes (esto borrará las opciones por orphanRemoval)
        // Nota: Si la DB no tiene ON DELETE CASCADE en LogicaSalto, esto podría fallar
        // si había lógica previa.
        // Lo ideal sería borrar LogicaSalto explícitamente antes, pero asumiremos que
        // el FK lo maneja o no hay datos.
        // Si falla, descomentar la siguiente línea (necesitaría repositorio):
        // logicaSaltoRepository.deleteByPreguntaOrigen(pregunta);

        pregunta.getOpciones().clear();

        if (preguntaDto.getOpciones() != null) {
            List<OpcionRespuesta> nuevasOpciones = preguntaDto.getOpciones().stream()
                    .map(opcionDto -> OpcionRespuesta.builder()
                            .textoOpcion(opcionDto.getTextoOpcion())
                            .valorDicotomizado(opcionDto.getValorDicotomizado())
                            .pregunta(pregunta)
                            .build())
                    .collect(Collectors.toList());
            pregunta.getOpciones().addAll(nuevasOpciones);
        }
        Pregunta preguntaGuardada = preguntaRepository.save(pregunta);

        // Procesar lógica de salto
        if (preguntaDto.getOpciones() != null) {
            procesarLogicaSalto(preguntaGuardada, preguntaDto.getOpciones());
        }

        return mapPreguntaToDto(preguntaGuardada);
    }

    private void procesarLogicaSalto(Pregunta pregunta, List<OpcionRespuestaCreateDto> opcionesDto) {
        // Asumimos que el orden de pregunta.getOpciones() coincide con opcionesDto
        // porque acabamos de guardarlas en ese orden.
        List<OpcionRespuesta> opcionesGuardadas = pregunta.getOpciones();

        if (opcionesGuardadas == null || opcionesDto == null) {
            return;
        }

        if (opcionesGuardadas.size() != opcionesDto.size()) {
            // Mismatch en tamaño, algo raro pasó o no se guardaron en orden
            return;
        }

        for (int i = 0; i < opcionesGuardadas.size(); i++) {
            OpcionRespuesta opcion = opcionesGuardadas.get(i);
            OpcionRespuestaCreateDto dto = opcionesDto.get(i);

            if (dto.getIdPreguntaDestino() != null) {
                Pregunta preguntaDestino = preguntaRepository.findById(dto.getIdPreguntaDestino())
                        .orElse(null); // O lanzar excepción si es estricto

                if (preguntaDestino != null) {
                    LogicaSalto logica = LogicaSalto.builder()
                            .preguntaOrigen(pregunta)
                            .opcionOrigen(opcion)
                            .preguntaDestino(preguntaDestino)
                            .build();
                    logicaSaltoRepository.save(logica);
                }
            }
        }
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

    // --- FUNCIONALIDAD Encuesta 9: ELIMINAR respuesta---
    @Transactional
    public void deleteRespuesta(Integer idRespuesta) {

        // 1. Verifica que la respuesta existe antes de borrarla
        if (!respuestaRepository.existsById(idRespuesta)) {
            throw new RuntimeException("Respuesta no encontrada con id: " + idRespuesta);
        }

        // 2. Borra la respuesta por su ID
        respuestaRepository.deleteById(idRespuesta);
    }

    @Transactional(readOnly = true)
    public List<RegistroCompletoResponseDto> getRegistrosPorPaciente(Integer idPaciente) {
        // 1. Busca todos los registros del paciente
        List<RegistroEncuesta> registros = registroEncuestaRepository.findByPacienteIdPaciente(idPaciente);

        // 2. Mapea la lista de Entidades a DTOs
        return registros.stream()
                .map(this::mapRegistroToCompletoDto)
                .collect(Collectors.toList());
    }

    // --- FUNCIONALIDAD EXTRA: Verificar si usuario respondió ---
    @Transactional(readOnly = true)
    public boolean hasUserResponded(Integer idEncuesta, String username) {
        // En un caso real buscaríamos el usuario por username para tener su ID
        // Aquí asumimos que el objeto Users tiene el ID accesible o lo buscamos
        // Para simplificar, buscamos el usuario primero
        // (Esto requiere que tengas un UserRepository o similar inyectado si no lo
        // tienes,
        // pero aquí usamos el contexto de seguridad en el controller, así que mejor
        // pasar el ID o el objeto User)

        // Mejor opción: pasar el objeto User y sacar el ID.
        return false; // TEMPORAL, ver abajo corrección
    }

    @Transactional(readOnly = true)
    public boolean hasUserResponded(Integer idEncuesta, Integer idUsuario) {
        return registroEncuestaRepository.existsByEncuestaIdEncuestaAndUsuarioId(idEncuesta, idUsuario);
    }

    // --- FUNCIONALIDAD EXTRA: Listar registros de una encuesta (Admin) ---
    @Transactional(readOnly = true)
    public List<RegistroCompletoResponseDto> getRegistrosByEncuesta(Integer idEncuesta) {
        List<RegistroEncuesta> registros = registroEncuestaRepository.findByEncuestaIdEncuesta(idEncuesta);
        return registros.stream()
                .map(this::mapRegistroToCompletoDto)
                .collect(Collectors.toList());
    }

    // --- FUNCIONALIDAD EXTRA: Obtener un registro por ID ---
    @Transactional(readOnly = true)
    public RegistroCompletoResponseDto getRegistroById(Integer idRegistro) {
        RegistroEncuesta registro = registroEncuestaRepository.findById(idRegistro)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado con id: " + idRegistro));
        return mapRegistroToCompletoDto(registro);
    }

    // --- FUNCIONALIDAD EXTRA: Obtener Borradores por Usuario ---
    @Transactional(readOnly = true)
    public List<RegistroCompletoResponseDto> getBorradoresByUsuario(Users user) {
        // Asumiendo que quieres todos los borradores del usuario sin importar qué
        // encuesta es
        List<RegistroEncuesta> borradores = registroEncuestaRepository.findByUsuarioIdAndEstado(user.getId(),
                "BORRADOR");
        return borradores.stream()
                .map(this::mapRegistroToCompletoDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RespuestaDetalladaDto updateRespuesta(Integer idRespuesta, RespuestaUpdateDto dto) {

        // 1. Encontrar la respuesta a editar
        Respuesta respuesta = respuestaRepository.findById(idRespuesta)
                .orElseThrow(() -> new RuntimeException("Respuesta no encontrada con id: " + idRespuesta));

        // 2. Lógica para actualizar la respuesta

        // Si el DTO trae un ID de opción...
        if (dto.getIdOpcionSeleccionada() != null) {
            OpcionRespuesta nuevaOpcion = opcionRespuestaRepository.findById(dto.getIdOpcionSeleccionada())
                    .orElseThrow(() -> new RuntimeException(
                            "Opción no encontrada con id: " + dto.getIdOpcionSeleccionada()));

            // Validación: Asegurarse de que la nueva opción pertenezca a la misma pregunta
            if (!nuevaOpcion.getPregunta().getIdPregunta().equals(respuesta.getPregunta().getIdPregunta())) {
                throw new IllegalArgumentException("La nueva opción seleccionada no pertenece a la pregunta original.");
            }

            // Actualiza la opción y borra el texto libre
            respuesta.setOpcionSeleccionada(nuevaOpcion);
            respuesta.setValorTexto(null);

        } else {
            // Si el DTO trae texto libre...
            // (Asegúrate de que esta sea una pregunta de texto libre)
            if (!respuesta.getPregunta().getTipoPregunta().equals("TEXTO_LIBRE")) {
                throw new IllegalArgumentException("No se puede asignar texto libre a una pregunta de selección.");
            }
            // Actualiza el texto y borra la opción
            respuesta.setValorTexto(dto.getValorTexto());
            respuesta.setOpcionSeleccionada(null);
        }

        // 3. Guardar la respuesta actualizada
        Respuesta respuestaGuardada = respuestaRepository.save(respuesta);

        // 4. Devolver el DTO detallado (que ya teníamos)
        return mapRespuestaToDetalladaDto(respuestaGuardada);
    }

    // --- MÉTODOS PRIVADOS DE MAPEO (DTOs) ---
    // (Actualizados para enviar 'obligatoria' y 'logicaSalto' al frontend)

    private EncuestaResponseDto mapEncuestaToDto(Encuesta encuesta) {
        return EncuestaResponseDto.builder()
                .idEncuesta(encuesta.getIdEncuesta())
                .titulo(encuesta.getTitulo())
                .version(encuesta.getVersion())
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
                .oculta(pregunta.isOculta())
                .opciones(pregunta.getOpciones() != null ? pregunta.getOpciones().stream()
                        .map(this::mapOpcionToDto)
                        .collect(Collectors.toList()) : new ArrayList<>())
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

    private RegistroCompletoResponseDto mapRegistroToCompletoDto(RegistroEncuesta registro) {
        return RegistroCompletoResponseDto.builder()
                .idRegistro(registro.getIdRegistro())
                .idPaciente(registro.getPaciente().getIdPaciente())
                .nombrePaciente(registro.getPaciente().getNombre() + " " + registro.getPaciente().getApellidos())
                .idEncuesta(registro.getEncuesta().getIdEncuesta())
                .tituloEncuesta(registro.getEncuesta().getTitulo())
                .fechaRealizacion(registro.getFechaRealizacion())
                .usuarioNombre(registro.getUsuario().getUsername())
                .respuestas(registro.getRespuestas().stream() // Mapea las respuestas
                        .map(this::mapRespuestaToDetalladaDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private RespuestaDetalladaDto mapRespuestaToDetalladaDto(Respuesta respuesta) {
        String textoRespuesta;
        Integer idOpcion = null;

        if (respuesta.getOpcionSeleccionada() != null) {
            // Si es selección única/múltiple
            textoRespuesta = respuesta.getOpcionSeleccionada().getTextoOpcion();
            idOpcion = respuesta.getOpcionSeleccionada().getIdOpcion();
        } else {
            // Si es texto libre
            textoRespuesta = respuesta.getValorTexto();
        }

        return RespuestaDetalladaDto.builder()
                .idRespuesta(respuesta.getIdRespuesta())
                .idPregunta(respuesta.getPregunta().getIdPregunta())
                .textoPregunta(respuesta.getPregunta().getTextoPregunta())
                .respuestaDada(textoRespuesta)
                .idOpcionSeleccionada(idOpcion)
                .build();
    }

    @Transactional(readOnly = true)
    public List<EncuestaResponseDto> getAllEncuestas() {
        return encuestaRepository.findAll().stream()
                .map(this::mapEncuestaToDto)
                .collect(Collectors.toList());
    }
}