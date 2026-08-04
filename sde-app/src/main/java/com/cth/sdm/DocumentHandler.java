package com.cth.sdm;

import java.io.File;

public interface DocumentHandler {
    boolean canHandle(File file);
    void handle(File file, DocumentService docService);
}
