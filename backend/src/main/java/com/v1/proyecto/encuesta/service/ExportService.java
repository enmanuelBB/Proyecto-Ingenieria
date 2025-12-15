package com.v1.proyecto.encuesta.service;

import com.v1.proyecto.auth.model.Role;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import com.v1.proyecto.encuesta.model.Encuesta;
import com.v1.proyecto.encuesta.model.Pregunta;
import com.v1.proyecto.encuesta.model.RegistroEncuesta;
import com.v1.proyecto.encuesta.model.Respuesta;
import com.v1.proyecto.encuesta.repository.EncuestaRepository;
import com.v1.proyecto.encuesta.repository.RegistroEncuestaRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final EncuestaRepository encuestaRepository;
    private final RegistroEncuestaRepository registroEncuestaRepository;
    private final DataEncoder dataEncoder;

    @Transactional(readOnly = true)
    public ByteArrayInputStream generateExcel(Integer idEncuesta, Integer idPaciente, Role role) throws IOException {
        Encuesta encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));

        List<RegistroEncuesta> registros;
        if (idPaciente != null) {
            registros = registroEncuestaRepository.findByEncuestaIdEncuestaAndPacienteIdPaciente(idEncuesta,
                    idPaciente);
        } else {
            registros = registroEncuestaRepository.findByEncuestaIdEncuesta(idEncuesta);
        }
        List<Pregunta> preguntas = encuesta.getPreguntas().stream()
                .sorted(Comparator.comparing(Pregunta::getIdPregunta))
                .collect(Collectors.toList());

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Resultados");

            // Header
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("ID Registro");
            headerRow.createCell(1).setCellValue("Fecha");
            headerRow.createCell(2).setCellValue("Paciente");
            headerRow.createCell(3).setCellValue("Usuario");

            int colIdx = 4;
            for (Pregunta p : preguntas) {
                headerRow.createCell(colIdx++).setCellValue(p.getTextoPregunta());
            }

            // Data
            int rowIdx = 1;
            for (RegistroEncuesta registro : registros) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(registro.getIdRegistro());
                row.createCell(1).setCellValue(registro.getFechaRealizacion().toString());

                // Anonymize Patient
                row.createCell(2).setCellValue(dataEncoder.anonymizePaciente(registro.getPaciente(), role));

                // Anonymize User
                row.createCell(3).setCellValue(dataEncoder.anonymizeUsuario(registro.getUsuario(), role));

                Map<Integer, String> respuestasMap = registro.getRespuestas().stream()
                        .collect(Collectors.toMap(
                                r -> r.getPregunta().getIdPregunta(),
                                r -> this.getRespuestaTexto(r, role)));

                colIdx = 4;
                for (Pregunta p : preguntas) {
                    String respuesta = respuestasMap.getOrDefault(p.getIdPregunta(), "");
                    row.createCell(colIdx++).setCellValue(respuesta);
                }
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream generatePdf(Integer idEncuesta, Integer idPaciente, Role role) {
        Encuesta encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));

        // Ensure we load questions and options
        List<Pregunta> preguntas = encuesta.getPreguntas().stream()
                .sorted(Comparator.comparing(Pregunta::getIdPregunta))
                .collect(Collectors.toList());

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Título
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
            Paragraph title = new Paragraph("Diccionario de Datos: " + encuesta.getTitulo(), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            document.add(new Paragraph("Versión: " + encuesta.getVersion()));
            document.add(new Paragraph(" "));
            document.add(new Paragraph(
                    "Este documento detalla la codificación (dicotomización) aplicada a cada pregunta y sus opciones de respuesta para usuarios no administrativos (Analistas/Investigadores)."));
            document.add(new Paragraph(" "));

            // Detailed Table
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            Font questionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);

            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 4f, 4f, 1f }); // Pregunta wider, Option wide, Value narrow

            addHeaderCell(table, "Pregunta", headerFont);
            addHeaderCell(table, "Opción de Respuesta", headerFont);
            addHeaderCell(table, "Valor", headerFont);

            for (Pregunta p : preguntas) {
                boolean isFirstOption = true;
                List<com.v1.proyecto.encuesta.model.OpcionRespuesta> opciones = p.getOpciones();

                if (opciones != null && !opciones.isEmpty()) {
                    for (com.v1.proyecto.encuesta.model.OpcionRespuesta op : opciones) {
                        String textoOpcion = op.getTextoOpcion();
                        // Encode using role USER to see the dichotomized value (0, 1, etc.)
                        // We use the question text to ensure context-aware encoding (e.g. H. Pylori)
                        // works
                        String val = dataEncoder.encodeRespuesta(p.getTextoPregunta(), textoOpcion, Role.USER);

                        // Add Question Text only on the first row for clarity
                        if (isFirstOption) {
                            addCell(table, p.getTextoPregunta(), questionFont, new Color(240, 240, 240));
                            isFirstOption = false;
                        } else {
                            addCell(table, "", dataFont, Color.WHITE); // Empty cell for subsequent options
                        }

                        addCell(table, textoOpcion, dataFont, Color.WHITE);
                        addCell(table, val, dataFont, Color.WHITE);
                    }
                } else {
                    // Open Text Question
                    // Try to guess if it's a known field from our manual dictionary
                    // or just label it as "Texto Libre"
                    addCell(table, p.getTextoPregunta(), questionFont, new Color(240, 240, 240));
                    addCell(table, "(Texto Libre / Numérico)", dataFont, Color.WHITE);

                    // See if we have a static mapping for this question's potential answers
                    // roughly?
                    // Hard to guess. Just output raw if no options.
                    // But wait, H. Pylori might be free text in some versions?
                    // Assuming DB has options. If not, we can't list "que respuestas hay".
                    // We'll leave it as Free Text.
                    addCell(table, "-", dataFont, Color.WHITE);
                }

                // Add a small divider or just rely on the question text cell background
            }

            document.add(table);
            document.close();

        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream generateCsv(Integer idEncuesta, Integer idPaciente, Role role) {
        Encuesta encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));

        List<RegistroEncuesta> registros;
        if (idPaciente != null) {
            registros = registroEncuestaRepository.findByEncuestaIdEncuestaAndPacienteIdPaciente(idEncuesta,
                    idPaciente);
        } else {
            registros = registroEncuestaRepository.findByEncuestaIdEncuesta(idEncuesta);
        }
        List<Pregunta> preguntas = encuesta.getPreguntas().stream()
                .sorted(Comparator.comparing(Pregunta::getIdPregunta))
                .collect(Collectors.toList());

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {

            // Header
            StringBuilder header = new StringBuilder();
            header.append("ID Registro,Fecha,Paciente,Usuario");
            for (Pregunta p : preguntas) {
                header.append(",").append(escapeCsv(p.getTextoPregunta()));
            }
            writer.println(header.toString());

            // Data
            for (RegistroEncuesta registro : registros) {
                StringBuilder row = new StringBuilder();
                row.append(registro.getIdRegistro()).append(",");
                row.append(registro.getFechaRealizacion()).append(",");

                // Anonymize Patient
                row.append(escapeCsv(dataEncoder.anonymizePaciente(registro.getPaciente(), role)))
                        .append(",");

                // Anonymize User
                row.append(escapeCsv(dataEncoder.anonymizeUsuario(registro.getUsuario(), role)));

                Map<Integer, String> respuestasMap = registro.getRespuestas().stream()
                        .collect(Collectors.toMap(
                                r -> r.getPregunta().getIdPregunta(),
                                r -> this.getRespuestaTexto(r, role)));

                for (Pregunta p : preguntas) {
                    row.append(",").append(escapeCsv(respuestasMap.getOrDefault(p.getIdPregunta(), "")));
                }
                writer.println(row.toString());
            }

            writer.flush();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private String getRespuestaTexto(Respuesta r, Role role) {
        String raw = "";
        if (r.getOpcionSeleccionada() != null) {
            raw = r.getOpcionSeleccionada().getTextoOpcion();
        } else {
            raw = r.getValorTexto() != null ? r.getValorTexto() : "";
        }
        return dataEncoder.encodeRespuesta(r.getPregunta().getTextoPregunta(), raw, role);
    }

    private String escapeCsv(String data) {
        if (data == null)
            return "";
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(Color.DARK_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, Font font, Color backgroundColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(4);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(backgroundColor);
        table.addCell(cell);
    }
}
