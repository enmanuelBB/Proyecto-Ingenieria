package com.v1.proyecto.encuesta.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList; 
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "encuesta")
public class Encuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_encuesta")
    private Integer idEncuesta;

    @Column(nullable = false)
    private String titulo;

    private String version;

    @OneToMany(mappedBy = "encuesta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default 
    private List<Pregunta> preguntas = new ArrayList<>(); 

    @OneToMany(mappedBy = "encuesta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default 
    private List<RegistroEncuesta> registros = new ArrayList<>();

}