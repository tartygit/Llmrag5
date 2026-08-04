package com.cth.sdm;

import java.io.File;

public class DefaultWordDocumentHandler implements DocumentHandler {
    @Override
    public boolean canHandle(File file) {
        String name = file.getName().toLowerCase();
        return name.endsWith(".doc") || name.endsWith(".docx");
    }

    @Override
    public void handle(File file, DocumentService docService) {
        System.out.println("[Handler] Processing Word Document: " + file.getName());
        docService.processDocumentFile(file, "Word handler processed the document paragraphs successfully.");
    }
}
