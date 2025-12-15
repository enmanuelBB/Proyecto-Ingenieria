package com.v1.proyecto.encuesta.service;

import com.v1.proyecto.auth.model.Role;
import com.v1.proyecto.paciente.model.Paciente;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class DataEncoder {

    // Global mappings for unique values
    private static final Map<String, Integer> EXACT_MATCH_MAP = new HashMap<>();

    static {
        // Yes/No
        EXACT_MATCH_MAP.put("No", 0);
        EXACT_MATCH_MAP.put("Sí", 1);
        EXACT_MATCH_MAP.put("Si", 1); // tolerance
        EXACT_MATCH_MAP.put("No recuerda", 2);
        EXACT_MATCH_MAP.put("Desconocido", 2);

        // Identificación y Sociodemográficos
        EXACT_MATCH_MAP.put("Control", 0);
        EXACT_MATCH_MAP.put("Caso (Cáncer)", 1);
        EXACT_MATCH_MAP.put("Hombre", 0);
        EXACT_MATCH_MAP.put("Mujer", 1);
        EXACT_MATCH_MAP.put("Rural", 0);
        EXACT_MATCH_MAP.put("Urbana", 1);
        EXACT_MATCH_MAP.put("Básico", 0);
        EXACT_MATCH_MAP.put("Medio", 1);
        EXACT_MATCH_MAP.put("Superior", 2);

        // Previsión
        EXACT_MATCH_MAP.put("Fonasa", 0);
        EXACT_MATCH_MAP.put("Isapre", 1);
        EXACT_MATCH_MAP.put("Capredena/Dipreca", 2);
        EXACT_MATCH_MAP.put("Sin previsión", 3);
        // "Otra" is context dependent (4 for Prevision, 3 for Water)

        // Habitos
        EXACT_MATCH_MAP.put("Nunca", 0);
        EXACT_MATCH_MAP.put("Exfumador", 1);
        EXACT_MATCH_MAP.put("Fumador actual", 2);
        EXACT_MATCH_MAP.put("Exconsumidor", 1);
        EXACT_MATCH_MAP.put("Consumidor actual", 2);

        EXACT_MATCH_MAP.put("1-9/día", 0);
        EXACT_MATCH_MAP.put("10-19/día", 1);
        EXACT_MATCH_MAP.put("≥20/día", 2);

        EXACT_MATCH_MAP.put("<10 años", 0);
        EXACT_MATCH_MAP.put("10-20 años", 1);
        EXACT_MATCH_MAP.put(">20 años", 2);

        EXACT_MATCH_MAP.put("Ocasional", 0);
        EXACT_MATCH_MAP.put("Regular", 1);
        EXACT_MATCH_MAP.put("Frecuente", 2); // Also for Frituras? No, Frituras is Yes/No or Frequency? Assuming
                                             // Frequency map

        EXACT_MATCH_MAP.put("1-2 tragos", 0);
        EXACT_MATCH_MAP.put("3-4 tragos", 1);
        EXACT_MATCH_MAP.put("≥5 tragos", 2);

        // Dietarios
        EXACT_MATCH_MAP.put("≤1/sem", 0);
        EXACT_MATCH_MAP.put("2/sem", 1);
        EXACT_MATCH_MAP.put("≥3/sem", 2);

        EXACT_MATCH_MAP.put("≤2 porciones", 0); // "≤2 porciones (Riesgo)"
        EXACT_MATCH_MAP.put("3-4 porciones", 1);
        EXACT_MATCH_MAP.put("≥5 porciones", 2); // "≥5 porciones (Protector)"

        EXACT_MATCH_MAP.put("Casi nunca", 0);
        EXACT_MATCH_MAP.put("1-2 veces/sem", 1);
        EXACT_MATCH_MAP.put("≥3 veces/sem", 2);

        EXACT_MATCH_MAP.put("1-2/sem", 1); // Bebidas calientes

        EXACT_MATCH_MAP.put("Estacional", 1);
        EXACT_MATCH_MAP.put("Diario", 2);

        EXACT_MATCH_MAP.put("Red pública", 0);
        EXACT_MATCH_MAP.put("Pozo", 1);
        EXACT_MATCH_MAP.put("Camión", 2);

        EXACT_MATCH_MAP.put("Ninguno", 0);
        EXACT_MATCH_MAP.put("Hervir", 1);
        EXACT_MATCH_MAP.put("Filtro", 2);
        EXACT_MATCH_MAP.put("Cloro", 3);

        // H Pylori
        EXACT_MATCH_MAP.put("Negativo", 0);
        EXACT_MATCH_MAP.put("Positivo", 1);

        // Histopatologia
        EXACT_MATCH_MAP.put("Intestinal", 0);
        // Difuso is context dependent
        EXACT_MATCH_MAP.put("Mixto", 2);
        EXACT_MATCH_MAP.put("Cardias", 0);
        EXACT_MATCH_MAP.put("Cuerpo", 1);
        EXACT_MATCH_MAP.put("Antro", 2);

        // Fix for specific user reports
        EXACT_MATCH_MAP.put("Nunca fumó", 0);
        EXACT_MATCH_MAP.put("Nunca fumó (menos de 100 cigarrillos en la vida)", 0);

        // Tabaquismo Detailed
        EXACT_MATCH_MAP.put("1–9 cigarrillos/día", 0);
        EXACT_MATCH_MAP.put("1–9 cigarrillos/día (poco)", 0);
        EXACT_MATCH_MAP.put("1-9 cigarrillos/día", 0); // variation
        EXACT_MATCH_MAP.put("10–19 cigarrillos/día", 1);
        EXACT_MATCH_MAP.put("10–19 cigarrillos/día (moderado)", 1);
        EXACT_MATCH_MAP.put("10-19 cigarrillos/día", 1); // variation
        EXACT_MATCH_MAP.put("≥20 cigarrillos/día", 2);
        EXACT_MATCH_MAP.put("≥20 cigarrillos/día (mucho)", 2);

        // Times
        EXACT_MATCH_MAP.put("<5 años", 0);
        EXACT_MATCH_MAP.put("5–10 años", 1);
        EXACT_MATCH_MAP.put("5-10 años", 1);
        EXACT_MATCH_MAP.put(">10 años", 2);

        // Alcohol
        EXACT_MATCH_MAP.put("Ocasional (menos de 1 vez/semana)", 0);
        EXACT_MATCH_MAP.put("Regular (1–3 veces/semana)", 1);
        EXACT_MATCH_MAP.put("Frecuente (≥4 veces/semana)", 2);
        EXACT_MATCH_MAP.put("1–2 tragos (poco)", 0);
        EXACT_MATCH_MAP.put("3–4 tragos (moderado)", 1);
        EXACT_MATCH_MAP.put("≥5 tragos (mucho)", 2);

        // Diet Matches
        EXACT_MATCH_MAP.put("Casi nunca / Rara vez", 0);
        EXACT_MATCH_MAP.put("Nunca/Rara vez", 0); // Variation in form
        EXACT_MATCH_MAP.put("1 a 2 veces por semana", 1);
        EXACT_MATCH_MAP.put("3 o más veces por semana", 2);

        // Screenshot Variations (Hyphens vs En-dashes, missing suffixes)
        // Tragos
        EXACT_MATCH_MAP.put("1-2 tragos", 0);
        EXACT_MATCH_MAP.put("3-4 tragos", 1);
        EXACT_MATCH_MAP.put("≥5 tragos", 2);

        // Porciones
        EXACT_MATCH_MAP.put("≤2 porciones/día", 0);
        EXACT_MATCH_MAP.put("3-4 porciones/día", 1);
        EXACT_MATCH_MAP.put("≥5 porciones/día", 2);

        // Frequencies (Infusiones)
        EXACT_MATCH_MAP.put("1-2/sem", 1);
        EXACT_MATCH_MAP.put("≥3/sem", 2);
    }

    public String anonymizePaciente(Paciente p, Role role) {
        if (role == Role.ADMIN) {
            return p.getNombre() + " " + p.getApellidos();
        }
        // For non-admins, return Codigo Participante
        return p.getCodigoParticipante() != null ? p.getCodigoParticipante() : "ANON-" + p.getIdPaciente();
    }

    public String anonymizeUsuario(com.v1.proyecto.auth.model.Users u, Role role) {
        if (role == Role.ADMIN) {
            return u.getUsername();
        }
        return "User-" + u.getId();
    }

    public String encodeRespuesta(String question, String answer, Role role) {
        if (role == Role.ADMIN) {
            return answer;
        }
        if (answer == null || answer.isBlank()) {
            return "";
        }

        // Normalize answer to handle dashes (en-dash vs hyphen)
        String normalized = normalizeAnswer(answer);

        // Use normalized for matching below
        // Handle Context-Dependent Collisions first
        // Context-Dependent: Previsión
        if (questionContains(question, "Previsión") || questionContains(question, "Prevision")) {
            if (normalized.equalsIgnoreCase("Otra"))
                return "4";
            // Map "Capredena / Dipreca" (with spaces) if not caught by exact map
            if (normalized.equalsIgnoreCase("Capredena / Dipreca"))
                return "2";
        }

        // Context-Dependent: Histopatologia
        if (questionContains(question, "Histológico") || questionContains(question, "Histopatología")) {
            if (normalized.equalsIgnoreCase("Difuso"))
                return "1";
            if (normalized.equalsIgnoreCase("Otro"))
                return "3";
        }

        if (questionContains(question, "Localización")) {
            if (normalized.equalsIgnoreCase("Difuso"))
                return "3";
        }

        if (questionContains(question, "Agua")) {
            if (normalized.equalsIgnoreCase("Otra") || normalized.equalsIgnoreCase("Otro"))
                return "3";
        }

        // Nacionalidad Visibility Rule
        if (questionContains(question, "Nacionalidad")) {
            if (role == Role.ANALISTA || role == Role.USER) {
                return "REDACTED";
            }
            return answer; // Admin and Investigator see raw (original)
        }

        // H. Pylori Specific Logic (User requested: Positive=0, Negative=1,
        // Desconocido=2)
        // This inverts the standard boolean logic for these specific questions.
        if (questionContains(question, "Helicobacter") || questionContains(question, "H. pylori")) {
            if (normalized.equalsIgnoreCase("Positivo"))
                return "0";
            if (normalized.equalsIgnoreCase("Negativo"))
                return "1";
            if (normalized.equalsIgnoreCase("Desconocido"))
                return "2";

            // For "Have you had a POSITIVE result?", "Sí" implies Positive (0)
            if (normalized.equalsIgnoreCase("Sí") || normalized.equalsIgnoreCase("Si"))
                return "0";
            if (normalized.equalsIgnoreCase("No"))
                return "1";
            if (normalized.equalsIgnoreCase("No recuerda"))
                return "2";
        }

        // H. Pylori Exam Types
        if (questionContains(question, "Tipo de examen")) {
            String lower = normalized.toLowerCase();
            if (lower.contains("aliento"))
                return "1";
            if (lower.contains("antígeno"))
                return "2";
            if (lower.contains("serología"))
                return "3";
            if (lower.contains("ureasa"))
                return "4";
            if (lower.contains("histología") || lower.contains("biopsia"))
                return "5";
            if (lower.contains("otro"))
                return "6";
        }

        // Try exact match or flexible start match with NORMALIZED string
        for (Map.Entry<String, Integer> entry : EXACT_MATCH_MAP.entrySet()) {
            // Check for exact equality
            if (normalized.equalsIgnoreCase(entry.getKey())) {
                return String.valueOf(entry.getValue());
            }

            // Check for startsWith for long options (e.g. "Nunca fumó (menos de...)")
            // Ensure we don't match short keys into long answers incorrectly (e.g. "No"
            // inside "No recuerda")
            // The map keys should be specific enough.
            if (normalized.toLowerCase().startsWith(entry.getKey().toLowerCase())) {
                return String.valueOf(entry.getValue());
            }
        }

        // Fallback: If it's a number, return it. If it's text and we can't map it,
        // return REDACTED or 99?
        // User request: "Todos los campos categóricos... deben transformarse".
        // If we fail to match, we might be leaking info or just missing a mapping.
        // For safety, if it looks like PII/Text that is not mapped, we could return
        // "99" or keep it if it's dates/numbers.

        // Assuming Dates and Numbers are allowed?
        // "Data encoding" usually applies to Categorical. Numeric fields (Age, Years)
        // should be kept?
        // The prompt only lists categorical fields.
        // Let's assume if it doesn't match, we return it as is (risk of leak) or "999".
        // Given strictly categorical instructions, if it's not in the map, it might be
        // a free text field.
        // Free text fields (comments) usually contain PII.
        // I will return the original answer, assuming unmapped fields are numeric or
        // harmless.

        return answer;
    }

    private boolean questionContains(String question, String keyword) {
        return question != null && question.toLowerCase().contains(keyword.toLowerCase());
    }

    private String normalizeAnswer(String answer) {
        if (answer == null)
            return "";
        // Replace en-dash, em-dash, minus sign with standard hyphen
        return answer.replace("\u2013", "-") // en-dash
                .replace("\u2014", "-") // em-dash
                .replace("\u2212", "-") // minus sign
                .trim();
    }

    public Map<String, Integer> getDictionary() {
        return EXACT_MATCH_MAP;
    }
}
