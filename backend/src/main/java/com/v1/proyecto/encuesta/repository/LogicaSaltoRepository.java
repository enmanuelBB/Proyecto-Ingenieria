package com.v1.proyecto.encuesta.repository;

import com.v1.proyecto.encuesta.model.LogicaSalto;
import com.v1.proyecto.encuesta.model.OpcionRespuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LogicaSaltoRepository extends JpaRepository<LogicaSalto, Integer> {
    Optional<LogicaSalto> findByOpcionOrigen(OpcionRespuesta opcionOrigen);
}
