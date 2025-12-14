package com.v1.proyecto.encuesta.repository;

import com.v1.proyecto.encuesta.model.RegistroEncuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroEncuestaRepository extends JpaRepository<RegistroEncuesta, Integer> {

    List<RegistroEncuesta> findByPacienteIdPaciente(Integer idPaciente);

    List<RegistroEncuesta> findByEncuestaIdEncuesta(Integer idEncuesta);

    List<RegistroEncuesta> findByEncuestaIdEncuestaAndPacienteIdPaciente(Integer idEncuesta, Integer idPaciente);

    boolean existsByEncuestaIdEncuestaAndUsuarioId(Integer idEncuesta, Integer idUsuario);

    List<RegistroEncuesta> findByUsuarioIdAndEstado(Integer idUsuario, String estado);
}