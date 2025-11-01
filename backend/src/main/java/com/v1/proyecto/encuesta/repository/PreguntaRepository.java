package com.v1.proyecto.encuesta.repository;
import com.v1.proyecto.encuesta.model.Pregunta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface PreguntaRepository extends JpaRepository<Pregunta, Integer> {}