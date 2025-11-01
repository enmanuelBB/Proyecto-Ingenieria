package com.v1.proyecto.encuesta.repository;
import com.v1.proyecto.encuesta.model.Encuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface EncuestaRepository extends JpaRepository<Encuesta, Integer> {}