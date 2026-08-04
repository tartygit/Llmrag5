package com.cth.sdm;

import com.lowagie.text.Chunk;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private UserService userService;

    @GetMapping("/online")
    public ResponseEntity<?> getOnlineReport() {
        List<Document> docs = documentService.getAllDocuments();
        List<Map<String, Object>> reportRows = new ArrayList<>();

        for (Document d : docs) {
            Map<String, Object> row = new HashMap<>();
            row.put("docIdCode", d.getDocIdCode());
            row.put("appCode", d.getAppCode());
            row.put("phase", d.getPhaseNumber());
            row.put("title", d.getDocumentTitle());
            row.put("status", d.getStatus());
            row.put("maker", d.getMakerUsername());
            row.put("approver", d.getCheckerUsername() != null ? d.getCheckerUsername() : "N/A");
            row.put("remarks", d.getCheckerRemarks() != null ? d.getCheckerRemarks() : "");
            row.put("version", d.getVersionNumber());
            row.put("updatedAt", d.getUpdatedAt().toString());
            reportRows.add(row);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("appName", userService.getConfig("APP_NAME", "Software Development Document Environment"));
        response.put("reportDate", new Date().toString());
        response.put("data", reportRows);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/excel")
    public ResponseEntity<byte[]> downloadExcel() throws IOException {
        List<Document> docs = documentService.getAllDocuments();

        try (Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Approver Document Status Report");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            // Create Header Row
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            String[] headers = {"Document ID", "App Code", "Phase", "Document Title", "Status", "Maker", "Approver Name", "Remarks", "Version", "Last Updated"};
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Populate Data
            int rowIdx = 1;
            for (Document d : docs) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(d.getDocIdCode());
                row.createCell(1).setCellValue(d.getAppCode());
                row.createCell(2).setCellValue(d.getPhaseNumber());
                row.createCell(3).setCellValue(d.getDocumentTitle());
                row.createCell(4).setCellValue(d.getStatus());
                row.createCell(5).setCellValue(d.getMakerUsername());
                row.createCell(6).setCellValue(d.getCheckerUsername() != null ? d.getCheckerUsername() : "N/A");
                row.createCell(7).setCellValue(d.getCheckerRemarks() != null ? d.getCheckerRemarks() : "");
                row.createCell(8).setCellValue(d.getVersionNumber());
                row.createCell(9).setCellValue(d.getUpdatedAt().toString());
            }

            // Resize columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            byte[] bytes = out.toByteArray();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=document_approval_report.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(bytes);
        }
    }

    @GetMapping("/download/pdf")
    public ResponseEntity<byte[]> downloadPdf() {
        List<com.cth.sdm.Document> docs = documentService.getAllDocuments();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        com.lowagie.text.Document pdfDoc = new com.lowagie.text.Document();
        try {
            PdfWriter.getInstance(pdfDoc, out);
            pdfDoc.open();

            // Font configurations
            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            com.lowagie.text.Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 8);

            Paragraph p = new Paragraph("Approver Document Status Report", titleFont);
            p.setAlignment(Paragraph.ALIGN_CENTER);
            pdfDoc.add(p);
            pdfDoc.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 2f, 1.5f, 4f, 2.5f, 2.5f, 2.5f, 3f});

            String[] headers = {"Doc ID", "App", "Phase", "Title", "Status", "Maker", "Approver", "Last Updated"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                table.addCell(cell);
            }

            for (com.cth.sdm.Document d : docs) {
                table.addCell(new Phrase(d.getDocIdCode(), bodyFont));
                table.addCell(new Phrase(d.getAppCode(), bodyFont));
                table.addCell(new Phrase(String.valueOf(d.getPhaseNumber()), bodyFont));
                table.addCell(new Phrase(d.getDocumentTitle(), bodyFont));
                table.addCell(new Phrase(d.getStatus(), bodyFont));
                table.addCell(new Phrase(d.getMakerUsername(), bodyFont));
                table.addCell(new Phrase(d.getCheckerUsername() != null ? d.getCheckerUsername() : "N/A", bodyFont));
                table.addCell(new Phrase(d.getUpdatedAt().toString().substring(0, 10), bodyFont));
            }

            pdfDoc.add(table);
            pdfDoc.close();

        } catch (com.lowagie.text.DocumentException e) {
            e.printStackTrace();
        }

        byte[] bytes = out.toByteArray();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=document_approval_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(bytes);
    }
}
