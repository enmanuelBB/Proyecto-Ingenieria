package com.v1.proyecto.encuesta.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "logica_salto")
public class LogicaSalto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_logica")
    private Integer idLogica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pregunta_origen", nullable = false)
    private Pregunta preguntaOrigen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_opcion_origen")
    private OpcionRespuesta opcionOrigen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pregunta_destino", nullable = false)
    private Pregunta preguntaDestino;
}