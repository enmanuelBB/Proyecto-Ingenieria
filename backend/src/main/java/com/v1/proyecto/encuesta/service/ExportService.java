package com.v1.proyecto.encuesta.service;

import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
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

    @Transactional(readOnly = true)
    public ByteArrayInputStream generateExcel(Integer idEncuesta) throws IOException {
        Encuesta encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));
        List<RegistroEncuesta> registros = registroEncuestaRepository.findByEncuestaIdEncuesta(idEncuesta);
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
                row.createCell(2)
                        .setCellValue(registro.getPaciente().getNombre() + " " + registro.getPaciente().getApellidos());
                row.createCell(3).setCellValue(registro.getUsuario().getUsername());

                Map<Integer, String> respuestasMap = registro.getRespuestas().stream()
                        .collect(Collectors.toMap(
                                r -> r.getPregunta().getIdPregunta(),
                                this::getRespuestaTexto));

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
    public ByteArrayInputStream generatePdf(Integer idEncuesta) {
        Encuesta encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));
        List<RegistroEncuesta> registros = registroEncuestaRepository.findByEncuestaIdEncuesta(idEncuesta);
        List<Pregunta> preguntas = encuesta.getPreguntas().stream()
                .sorted(Comparator.comparing(Pregunta::getIdPregunta))
                .collect(Collectors.toList());

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph("Reporte de Encuesta: " + encuesta.getTitulo()));
            document.add(new Paragraph("Versión: " + encuesta.getVersion()));
            document.add(new Paragraph("Total Registros: " + registros.size()));
            document.add(new Paragraph(" ")); // Espacio

            PdfPTable table = new PdfPTable(4 + preguntas.size());
            table.setWidthPercentage(100);

            // Headers
            table.addCell("ID");
            table.addCell("Fecha");
            table.addCell("Paciente");
            table.addCell("Usuario");
            for (Pregunta p : preguntas) {
                table.addCell(p.getTextoPregunta());
            }

            // Data
            for (RegistroEncuesta registro : registros) {
                table.addCell(registro.getIdRegistro().toString());
                table.addCell(registro.getFechaRealizacion().toString());
                table.addCell(registro.getPaciente().getNombre() + " " + registro.getPaciente().getApellidos());
                table.addCell(registro.getUsuario().getUsername());

                Map<Integer, String> respuestasMap = registro.getRespuestas().stream()
                        .collect(Collectors.toMap(
                                r -> r.getPregunta().getIdPregunta(),
                                this::getRespuestaTexto));

                for (Pregunta p : preguntas) {
                    table.addCell(respuestasMap.getOrDefault(p.getIdPregunta(), ""));
                }
            }

            document.add(table);
            document.close();

        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream generateCsv(Integer idEncuesta) {
        Encuesta encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new RuntimeException("Encuesta no encontrada"));
        List<RegistroEncuesta> registros = registroEncuestaRepository.findByEncuestaIdEncuesta(idEncuesta);
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
                row.append(escapeCsv(registro.getPaciente().getNombre() + " " + registro.getPaciente().getApellidos()))
                        .append(",");
                row.append(escapeCsv(registro.getUsuario().getUsername()));

                Map<Integer, String> respuestasMap = registro.getRespuestas().stream()
                        .collect(Collectors.toMap(
                                r -> r.getPregunta().getIdPregunta(),
                                this::getRespuestaTexto));

                for (Pregunta p : preguntas) {
                    row.append(",").append(escapeCsv(respuestasMap.getOrDefault(p.getIdPregunta(), "")));
                }
                writer.println(row.toString());
            }

            writer.flush();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private String getRespuestaTexto(Respuesta r) {
        if (r.getOpcionSeleccionada() != null) {
            return r.getOpcionSeleccionada().getTextoOpcion();
        }
        return r.getValorTexto() != null ? r.getValorTexto() : "";
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
}
