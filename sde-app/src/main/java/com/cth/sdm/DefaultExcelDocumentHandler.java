package com.cth.sdm;

import java.io.File;

public class DefaultExcelDocumentHandler implements DocumentHandler {
    @Override
    public boolean canHandle(File file) {
        String name = file.getName().toLowerCase();
        return name.endsWith(".xls") || name.endsWith(".xlsx");
    }

    @Override
    public void handle(File file, DocumentService docService) {
        System.out.println("[Handler] Processing Excel Document: " + file.getName());
        docService.processDocumentFile(file, "Excel handler processed the workbook sheets successfully.");
    }
}
