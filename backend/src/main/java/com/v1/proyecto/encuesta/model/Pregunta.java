// Ubicación: encuesta/model/Pregunta.java
package com.v1.proyecto.encuesta.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pregunta")
public class Pregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pregunta")
    private Integer idPregunta;

    @Column(name = "texto_pregunta", nullable = false)
    private String textoPregunta;

    @Column(name = "tipo_pregunta", nullable = false)
    private String tipoPregunta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_encuesta", nullable = false)
    private Encuesta encuesta;

    @OneToMany(mappedBy = "pregunta", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true) // <--
                                                                                                               // ¡AÑADE
                                                                                                               // ORPHAN
                                                                                                               // REMOVAL!
    private List<OpcionRespuesta> opciones;

    @Column(name = "obligatoria", nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private boolean obligatoria;

    @Column(name = "oculta", nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private boolean oculta;

}