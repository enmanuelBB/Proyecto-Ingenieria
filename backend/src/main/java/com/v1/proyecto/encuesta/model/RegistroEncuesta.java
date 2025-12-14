package com.v1.proyecto.encuesta.model;

import com.v1.proyecto.auth.model.Users;
import com.v1.proyecto.paciente.model.Paciente;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "registro_encuesta")
public class RegistroEncuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro")
    private Integer idRegistro;

    @Column(name = "fecha_realizacion", nullable = false)
    private LocalDateTime fechaRealizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Users usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_encuesta", nullable = false)
    private Encuesta encuesta;

    @OneToMany(mappedBy = "registroEncuesta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Respuesta> respuestas;

    @Column(name = "estado")
    private String estado; // 'COMPLETADO', 'BORRADOR'
}