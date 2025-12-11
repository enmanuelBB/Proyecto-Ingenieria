package com.v1.proyecto.config;

import com.v1.proyecto.encuesta.model.Encuesta;
import com.v1.proyecto.encuesta.model.OpcionRespuesta;
import com.v1.proyecto.encuesta.model.Pregunta;
import com.v1.proyecto.encuesta.repository.EncuestaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

        @Bean
        public CommandLineRunner initEncuesta(EncuestaRepository encuestaRepository) {
                return args -> {
                        if (encuestaRepository.findByTitulo("Estudio Cáncer Gástrico").isEmpty()) {
                                crearEncuestaPredeterminada(encuestaRepository);
                        }
                };
        }

        @Transactional
        public void crearEncuestaPredeterminada(EncuestaRepository encuestaRepository) {
                Encuesta encuesta = Encuesta.builder()
                                .titulo("Estudio Cáncer Gástrico")
                                .version("1.0")
                                .preguntas(new ArrayList<>())
                                .build();

                List<Pregunta> preguntas = new ArrayList<>();

                // 1. Identificación del participante
                // 1. Identificación del participante
                // Removed redundant questions: Name, Phone, Email, Group, Inclusion Date ->
                // Already in Patient Data
                preguntas.add(crearPregunta(encuesta, "Código del participante", "TEXTO_LIBRE", true));

                // 2. Datos sociodemográficos
                // Removed redundant questions: Age, Sex, Address, Comuna, City -> Already in
                // Patient Data
                preguntas.add(crearPregunta(encuesta, "Nacionalidad", "TEXTO_LIBRE", true));
                // Removed Address, Comuna, City
                preguntas.add(crearPreguntaSeleccion(encuesta, "Zona", true, Arrays.asList("Urbana", "Rural")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "¿Vive usted en esta zona desde hace más de 5 años?",
                                true,
                                Arrays.asList("Sí", "No")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Nivel educacional", true,
                                Arrays.asList("Básico", "Medio", "Superior")));
                preguntas.add(crearPregunta(encuesta, "Ocupación actual", "TEXTO_LIBRE", true));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Previsión de salud actual", true,
                                Arrays.asList("Fonasa", "Isapre", "Capredena / Dipreca", "Sin previsión", "Otra")));
                preguntas.add(crearPregunta(encuesta, "Otra previsión (especificar)", "TEXTO_LIBRE", false));

                // 3. Antecedentes clínicos
                preguntas.add(crearPreguntaSeleccion(encuesta,
                                "Diagnóstico histológico de adenocarcinoma gástrico (solo casos)", false,
                                Arrays.asList("Sí", "No")));
                preguntas.add(crearPregunta(encuesta, "Fecha de diagnóstico (solo casos)", "TEXTO_LIBRE", false));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Antecedentes familiares de cáncer gástrico", true,
                                Arrays.asList("Sí", "No")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Antecedentes familiares de otros tipos de cáncer", true,
                                Arrays.asList("Sí", "No")));
                preguntas.add(crearPregunta(encuesta, "¿Cuál(es) otros tipos de cáncer?", "TEXTO_LIBRE", false));
                preguntas.add(crearPregunta(encuesta,
                                "Otras enfermedades relevantes (ej. gastritis crónica, úlcera péptica, anemia)",
                                "TEXTO_LIBRE", false));
                preguntas.add(crearPreguntaSeleccion(encuesta,
                                "Uso crónico de medicamentos gastrolesivos (AINES u otros)",
                                true, Arrays.asList("Sí", "No")));
                preguntas.add(crearPregunta(encuesta, "Especificar cuál medicamento", "TEXTO_LIBRE", false));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Cirugía gástrica previa (gastrectomía parcial)", true,
                                Arrays.asList("Sí", "No")));

                // 4. Variables antropométricas
                // 4. Variables antropométricas
                // Removed redundant questions: Weight, Height, IMC -> Already in Patient Data
                // preguntas.add(crearPregunta(encuesta, "Peso (kg)", "NUMERO", true));
                // preguntas.add(crearPregunta(encuesta, "Estatura (m)", "NUMERO", true));
                // preguntas.add(crearPregunta(encuesta, "Índice de masa corporal (IMC)",
                // "NUMERO", true));

                // 5. Tabaquismo
                preguntas.add(crearPreguntaSeleccion(encuesta, "Estado de tabaquismo", true,
                                Arrays.asList("Nunca fumó", "Exfumador", "Fumador actual")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Cantidad promedio fumada", false,
                                Arrays.asList("1–9 cigarrillos/día", "10–19 cigarrillos/día", "≥20 cigarrillos/día")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Tiempo total fumando", false,
                                Arrays.asList("<10 años", "10–20 años", ">20 años")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Si exfumador: tiempo desde que dejó de fumar", false,
                                Arrays.asList("<5 años", "5–10 años", ">10 años")));

                // 6. Consumo de alcohol
                preguntas.add(crearPreguntaSeleccion(encuesta, "Estado de consumo de alcohol", true,
                                Arrays.asList("Nunca", "Exconsumidor", "Consumidor actual")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Frecuencia consumo alcohol", false,
                                Arrays.asList("Ocasional (<1 vez/sem)", "Regular (1–3 veces/sem)",
                                                "Frecuente (≥4 veces/sem)")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Cantidad típica por ocasión", false,
                                Arrays.asList("1–2 tragos", "3–4 tragos", "≥5 tragos")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Años de consumo habitual", false,
                                Arrays.asList("<10 años", "10–20 años", ">20 años")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Si exconsumidor: tiempo desde que dejó de beber", false,
                                Arrays.asList("<5 años", "5–10 años", ">10 años")));

                // 7. Factores dietarios y ambientales
                preguntas.add(crearPreguntaSeleccion(encuesta, "Consumo de carnes procesadas/cecinas", true,
                                Arrays.asList("≤1/sem", "2/sem", "≥3/sem")));
                preguntas.add(
                                crearPreguntaSeleccion(encuesta, "Consumo de alimentos muy salados", true,
                                                Arrays.asList("Sí", "No")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Consumo de porciones de frutas y verduras frescas",
                                true,
                                Arrays.asList("≥5 porciones/día", "3–4 porciones/día", "≤2 porciones/día")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Consumo frecuente de frituras (≥3 veces por semana)",
                                true,
                                Arrays.asList("Sí", "No")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Consumo de alimentos muy condimentados", true,
                                Arrays.asList("Casi nunca", "1 a 2 veces por semana", "3 o más veces por semana")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Consumo de infusiones o bebidas muy calientes", true,
                                Arrays.asList("Nunca/Rara vez", "1–2/sem", "≥3/sem")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Exposición ocupacional a pesticidas", true,
                                Arrays.asList("Sí", "No")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Exposición a otros compuestos químicos", true,
                                Arrays.asList("Sí", "No")));
                preguntas.add(crearPregunta(encuesta, "¿Cuál(es) compuestos químicos?", "TEXTO_LIBRE", false));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Humo de leña en el hogar", true,
                                Arrays.asList("Nunca/Rara vez", "Estacional", "Diario")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Fuente principal de agua en el hogar", true,
                                Arrays.asList("Red pública", "Pozo", "Camión aljibe", "Otra")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Tratamiento del agua en casa", true,
                                Arrays.asList("Ninguno", "Hervir", "Filtro", "Cloro")));

                // 8. Infección por Helicobacter pylori
                preguntas.add(crearPreguntaSeleccion(encuesta, "Resultado del examen para Helicobacter pylori", true,
                                Arrays.asList("Positivo", "Negativo", "Desconocido")));
                preguntas.add(crearPreguntaSeleccion(encuesta,
                                "¿Ha tenido alguna vez un resultado POSITIVO para H. pylori en el pasado?", false,
                                Arrays.asList("Sí", "No", "No recuerda")));
                preguntas.add(crearPregunta(encuesta, "Si sí, año y tipo de examen", "TEXTO_LIBRE", false));
                preguntas.add(crearPreguntaSeleccion(encuesta, "¿Recibió tratamiento para erradicación de H. pylori?",
                                false,
                                Arrays.asList("Sí", "No", "No recuerda")));
                preguntas.add(crearPregunta(encuesta, "Si sí, año y esquema", "TEXTO_LIBRE", false));
                preguntas.add(
                                crearPreguntaSeleccion(encuesta, "Tipo de examen realizado", false,
                                                Arrays.asList("Test de aliento",
                                                                "Antígeno en deposiciones", "Serología",
                                                                "Test rápido de ureasa", "Histología", "Otro")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "¿Hace cuánto tiempo se realizó el test?", false,
                                Arrays.asList("<1 año", "1–5 años", ">5 años")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Uso de antibióticos o IBP en las 4 semanas previas",
                                false,
                                Arrays.asList("Sí", "No", "No recuerda")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "¿Ha repetido el examen posteriormente?", false,
                                Arrays.asList("Sí", "No")));
                preguntas.add(crearPregunta(encuesta, "Si repitió, fecha y resultado más reciente", "TEXTO_LIBRE",
                                false));

                // 9. Histopatología (solo casos)
                preguntas.add(crearPreguntaSeleccion(encuesta, "Tipo histológico", false,
                                Arrays.asList("Intestinal", "Difuso", "Mixto", "Otro")));
                preguntas.add(crearPreguntaSeleccion(encuesta, "Localización tumoral", false,
                                Arrays.asList("Cardias", "Cuerpo", "Antro", "Difuso")));
                preguntas.add(crearPregunta(encuesta, "Estadio clínico (TNM)", "TEXTO_LIBRE", false));

                encuesta.setPreguntas(preguntas);
                encuestaRepository.save(encuesta);
                System.out.println("Encuesta 'Estudio Cáncer Gástrico' creada exitosamente.");
        }

        private Pregunta crearPregunta(Encuesta encuesta, String texto, String tipo, boolean obligatoria) {
                return Pregunta.builder()
                                .textoPregunta(texto)
                                .tipoPregunta(tipo)
                                .obligatoria(obligatoria)
                                .encuesta(encuesta)
                                .opciones(new ArrayList<>())
                                .build();
        }

        private Pregunta crearPreguntaSeleccion(Encuesta encuesta, String texto, boolean obligatoria,
                        List<String> opcionesTexto) {
                Pregunta pregunta = Pregunta.builder()
                                .textoPregunta(texto)
                                .tipoPregunta("SELECCION_UNICA")
                                .obligatoria(obligatoria)
                                .encuesta(encuesta)
                                .build();

                List<OpcionRespuesta> opciones = new ArrayList<>();
                for (String op : opcionesTexto) {
                        opciones.add(OpcionRespuesta.builder()
                                        .textoOpcion(op)
                                        .pregunta(pregunta)
                                        .build());
                }
                pregunta.setOpciones(opciones);
                return pregunta;
        }
}
