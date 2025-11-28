package com.v1.proyecto.paciente.service;

import com.v1.proyecto.paciente.dto.PacienteRequestDto;
import com.v1.proyecto.paciente.dto.PacienteResponseDto;
import com.v1.proyecto.paciente.model.Paciente;
import com.v1.proyecto.paciente.repository.PacienteRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    // --- Métodos de Mapeo (NUEVOS) ---
    private Paciente convertToEntity(PacienteRequestDto dto) {
        return Paciente.builder()
                // --- 1. Identificación ---
                .rut(dto.getRut())
                .nombre(dto.getNombre())
                .apellidos(dto.getApellidos())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .codigoParticipante(dto.getCodigoParticipante())
                .grupo(dto.getGrupo())
                .fechaInclusion(dto.getFechaInclusion())

                // --- 2. Sociodemográficos ---
                .fechaNacimiento(dto.getFechaNacimiento())
                .sexo(dto.getSexo())
                .nacionalidad(dto.getNacionalidad())
                .direccion(dto.getDireccion())
                .comuna(dto.getComuna())
                .ciudad(dto.getCiudad())
                .zona(dto.getZona())
                .viveZonaMas5Anios(dto.getViveZonaMas5Anios())
                .nivelEducacional(dto.getNivelEducacional())
                .ocupacion(dto.getOcupacion())
                .prevision(dto.getPrevision())

                // --- 3. Antecedentes Clínicos ---
                .diagnosticoCancer(dto.getDiagnosticoCancer())
                .fechaDiagnostico(dto.getFechaDiagnostico())
                .antecedentesFamCancerGastrico(dto.getAntecedentesFamCancerGastrico())
                .antecedentesFamOtrosCancer(dto.getAntecedentesFamOtrosCancer())
                .detalleOtrosCancer(dto.getDetalleOtrosCancer())
                .enfermedadesRelevantes(dto.getEnfermedadesRelevantes())
                .usoCronicoMedicamentos(dto.getUsoCronicoMedicamentos())
                .cirugiaGastricaPrevia(dto.getCirugiaGastricaPrevia())

                // --- 4. Antropometría ---
                .peso(dto.getPeso())
                .estatura(dto.getEstatura())
                // Calculamos IMC automáticamente si ambos datos están presentes
                .imc((dto.getPeso() != null && dto.getEstatura() != null && dto.getEstatura() > 0)
                        ? dto.getPeso() / (dto.getEstatura() * dto.getEstatura())
                        : null)

                // --- 9. Histopatología ---
                .tipoHistologico(dto.getTipoHistologico())
                .localizacionTumoral(dto.getLocalizacionTumoral())
                .estadioTNM(dto.getEstadioTNM())
                .build();
    }

    private PacienteResponseDto convertToResponseDto(Paciente entity) {
        return PacienteResponseDto.builder()
                .idPaciente(entity.getIdPaciente())
                .rut(entity.getRut())
                .nombre(entity.getNombre())
                .apellidos(entity.getApellidos())
                .sexo(entity.getSexo())
                .fechaNacimiento(entity.getFechaNacimiento())
                .build();
    }

    // --- Métodos de Servicio (ACTUALIZADOS) ---

    @Transactional(readOnly = true)
    public List<PacienteResponseDto> findAllPacientes() {
        // 1. Busca entidades
        List<Paciente> pacientes = pacienteRepository.findAll();
        // 2. Convierte la lista a DTOs de respuesta
        return pacientes.stream()
                .map(this::convertToResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<PacienteResponseDto> findPacienteById(Integer id) {
        return pacienteRepository.findById(id)
                .map(this::convertToResponseDto); // Convierte a DTO si lo encuentra
    }

    @Transactional
    public PacienteResponseDto savePaciente(@Valid PacienteRequestDto pacienteDto) {
        // Validación de negocio
        if (pacienteDto.getRut() != null && pacienteRepository.findByRut(pacienteDto.getRut()).isPresent()) {
            throw new IllegalStateException("El RUT ingresado ya está registrado.");
        }
        // 1. Convierte el DTO a Entidad
        Paciente paciente = convertToEntity(pacienteDto);
        // 2. Guarda la Entidad
        Paciente pacienteGuardado = pacienteRepository.save(paciente);
        // 3. Devuelve un DTO de Respuesta
        return convertToResponseDto(pacienteGuardado);
    }

    @Transactional
    public Optional<PacienteResponseDto> updatePaciente(Integer id, @Valid PacienteRequestDto pacienteDto) {
        return pacienteRepository.findById(id)
                .map(pacienteExistente -> {
                    // Actualiza la entidad existente con datos del DTO
                    pacienteExistente.setNombre(pacienteDto.getNombre());
                    pacienteExistente.setApellidos(pacienteDto.getApellidos());
                    pacienteExistente.setRut(pacienteDto.getRut());
                    pacienteExistente.setSexo(pacienteDto.getSexo());
                    pacienteExistente.setFechaNacimiento(pacienteDto.getFechaNacimiento());

                    Paciente pacienteActualizado = pacienteRepository.save(pacienteExistente);
                    // Convierte la entidad actualizada a DTO
                    return convertToResponseDto(pacienteActualizado);
                });
    }

    @Transactional(readOnly = true)
    public Optional<PacienteResponseDto> findPacienteByRut(String rut) {
        return pacienteRepository.findByRut(rut)
                .map(this::convertToResponseDto);
    }

    @Transactional
    public void deletePaciente(Integer id) {
        pacienteRepository.deleteById(id);
    }
}
