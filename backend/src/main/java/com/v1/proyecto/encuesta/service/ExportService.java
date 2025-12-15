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

                row.createCell(3).setCellValue(registro.getUsuario().getUsername());

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

    @Transactional(readOnly = true)
    public ByteArrayInputStream generatePdf(Integer idEncuesta, Integer idPaciente, Role role) {
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
        Document document = new Document(PageSize.A4.rotate());

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Título
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
            Paragraph title = new Paragraph("Reporte de Encuesta: " + encuesta.getTitulo(), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph("Versión: " + encuesta.getVersion()));
            document.add(new Paragraph("Total Registros: " + registros.size()));
            document.add(new Paragraph(" ")); // Espacio

            PdfPTable table = new PdfPTable(4 + preguntas.size());
            table.setWidthPercentage(100);
            table.setHeaderRows(1);

            // Definir Font para Header y Data
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);

            // Headers
            addHeaderCell(table, "ID", headerFont);
            addHeaderCell(table, "Fecha", headerFont);
            addHeaderCell(table, "Paciente", headerFont);
            addHeaderCell(table, "Usuario", headerFont);

            for (Pregunta p : preguntas) {
                addHeaderCell(table, p.getTextoPregunta(), headerFont);
            }

            // Data
            boolean alternate = false;
            for (RegistroEncuesta registro : registros) {
                Color rowColor = alternate ? new Color(245, 245, 245) : Color.WHITE; // Light Gray vs White

                addCell(table, registro.getIdRegistro().toString(), dataFont, rowColor);
                addCell(table, registro.getFechaRealizacion().toString(), dataFont, rowColor);
                // Anonymize Patient
                addCell(table, dataEncoder.anonymizePaciente(registro.getPaciente(), role),
                        dataFont, rowColor);
                addCell(table, registro.getUsuario().getUsername(), dataFont, rowColor);

                Map<Integer, String> respuestasMap = registro.getRespuestas().stream()
                        .collect(Collectors.toMap(
                                r -> r.getPregunta().getIdPregunta(),
                                r -> this.getRespuestaTexto(r, role)));

                for (Pregunta p : preguntas) {
                    addCell(table, respuestasMap.getOrDefault(p.getIdPregunta(), ""), dataFont, rowColor);
                }
                alternate = !alternate;
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

                row.append(escapeCsv(registro.getUsuario().getUsername()));

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
