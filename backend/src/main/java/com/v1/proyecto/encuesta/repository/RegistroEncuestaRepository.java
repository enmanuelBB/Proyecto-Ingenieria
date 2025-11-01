package com.v1.proyecto.encuesta.repository;
import com.v1.proyecto.encuesta.model.RegistroEncuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface RegistroEncuestaRepository extends JpaRepository<RegistroEncuesta, Integer> {}