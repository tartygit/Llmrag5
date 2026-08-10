package com.cth.sdm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.*;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String appCode) {
        if (appCode != null && !appCode.isEmpty()) {
            return ResponseEntity.ok(documentService.getDocumentsByAppCode(appCode));
        }
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("appCode") String appCode,
            @RequestParam("phaseNumber") int phaseNumber,
            @RequestParam("documentTitle") String documentTitle,
            @RequestParam("description") String description,
            @RequestParam("versionNumber") String versionNumber,
            @RequestParam("documentCode") String documentCode,
            @RequestParam("makerUsername") String makerUsername,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        try {
            String fileName = null;
            String filePath = null;

            if (file != null && !file.isEmpty()) {
                fileName = file.getOriginalFilename();
                File uploadsDir = new File("./uploads");
                if (!uploadsDir.exists()) uploadsDir.mkdirs();

                File dest = new File(uploadsDir, System.currentTimeMillis() + "_" + fileName);
                try (InputStream is = file.getInputStream();
                     FileOutputStream fos = new FileOutputStream(dest)) {
                    byte[] buffer = new byte[4096];
                    int bytesRead;
                    while ((bytesRead = is.read(buffer)) != -1) {
                        fos.write(buffer, 0, bytesRead);
                    }
                }
                filePath = dest.getAbsolutePath();
            }

            Document doc = documentService.createDocument(appCode, phaseNumber, documentTitle,
                    description, versionNumber, documentCode, makerUsername, fileName, filePath);

            return ResponseEntity.ok(doc);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<?> returnToMaker(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String checker = body.get("checkerUsername");
        String remarks = body.get("remarks");
        try {
            Document doc = documentService.returnDocument(id, checker, remarks);
            return ResponseEntity.ok(doc);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String checker = body.get("checkerUsername");
        String remarks = body.get("remarks");
        try {
            Document doc = documentService.approveDocument(id, checker, remarks);
            return ResponseEntity.ok(doc);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String checker = body.get("checkerUsername");
        String remarks = body.get("remarks");
        try {
            Document doc = documentService.rejectDocument(id, checker, remarks);
            return ResponseEntity.ok(doc);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{docIdCode}/logs")
    public ResponseEntity<?> getLogs(@PathVariable String docIdCode) {
        return ResponseEntity.ok(documentService.getAuditLogsForDoc(docIdCode));
    }

    @GetMapping("/phases")
    public ResponseEntity<?> getPhasesConfig() {
        return ResponseEntity.ok(DocumentService.PHASE_TITLES);
    }
}
