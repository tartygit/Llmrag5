package com.cth.sdm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.File;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserService userService;

    private final List<DocumentHandler> handlers = new ArrayList<>();

    public DocumentService() {
        // Register default extensible document handlers
        handlers.add(new DefaultExcelDocumentHandler());
        handlers.add(new DefaultWordDocumentHandler());
    }

    public synchronized void registerHandler(DocumentHandler handler) {
        handlers.add(handler);
    }

    public List<DocumentHandler> getHandlers() {
        return Collections.unmodifiableList(handlers);
    }

    // Static default titles for each deliverable document under the 7 phases
    public static final Map<Integer, String[]> PHASE_TITLES = new HashMap<>();
    static {
        PHASE_TITLES.put(1, new String[]{"Business Case", "Project Charter", "Feasibility Study"});
        PHASE_TITLES.put(2, new String[]{"Functional Specification Document", "Use Case Document", "Data Model Specification"});
        PHASE_TITLES.put(3, new String[]{"System Architecture Document", "High Level Design", "Low Level Design"});
        PHASE_TITLES.put(4, new String[]{"Source Code Package", "API Documentation", "Build Artifacts"});
        PHASE_TITLES.put(5, new String[]{"Test Plan", "Test Cases Document", "UAT Report"});
        PHASE_TITLES.put(6, new String[]{"Deployment Guide", "Release Notes", "Operations Manual"});
        PHASE_TITLES.put(7, new String[]{"Project Closure Report", "Post Implementation Review", "Lessons Learned"});
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public List<Document> getDocumentsByAppCode(String appCode) {
        return documentRepository.findByAppCode(appCode);
    }

    @Transactional
    public Document createDocument(String appCode, int phase, String title, String description,
                                   String version, String docCode, String maker, String fileName, String filePath) {
        Document doc = new Document();
        doc.setAppCode(appCode);
        doc.setPhaseNumber(phase);
        doc.setDocumentTitle(title);
        doc.setDescription(description);
        doc.setVersionNumber(version);
        doc.setDocumentCode(docCode);
        doc.setMakerUsername(maker);
        doc.setFileName(fileName);
        doc.setFilePath(filePath);
        doc.setStatus("PENDING");
        doc.setProcessedStatus("NOT PROCESSED");

        // Dynamic Document ID generator
        // Sequence calculation
        List<Document> phaseDocs = documentRepository.findAll().stream()
                .filter(d -> d.getPhaseNumber() == phase && d.getAppCode().equalsIgnoreCase(appCode))
                .toList();
        int seq = phaseDocs.size() + 1;
        String idCode = String.format("%s-P%d%02d", appCode.toUpperCase(), phase, seq);
        doc.setDocIdCode(idCode);

        Document saved = documentRepository.save(doc);

        auditLogRepository.save(new AuditLog("UPLOAD", idCode, maker,
                "Document uploaded successfully for phase " + phase + ", Title: " + title));

        // Simulating SMS/Email alert to Approver (Checker)
        boolean approverSms = "true".equalsIgnoreCase(userService.getConfig("ENABLE_APPROVER_SMS_NOTIFY", "false"));
        boolean approverEmail = "true".equalsIgnoreCase(userService.getConfig("ENABLE_APPROVER_EMAIL_NOTIFY", "false"));

        if (approverSms || approverEmail) {
            System.out.println("[Notification] Notify checker of new document submission " + idCode);
        }

        return saved;
    }

    @Transactional
    public Document returnDocument(Long id, String checker, String remarks) {
        Document doc = documentRepository.findById(id).orElseThrow(() -> new RuntimeException("Document not found"));
        doc.setStatus("RETURNED_TO_MAKER");
        doc.setCheckerUsername(checker);
        doc.setCheckerRemarks(remarks);
        doc.setUpdatedAt(LocalDateTime.now());

        Document saved = documentRepository.save(doc);

        auditLogRepository.save(new AuditLog("RETURNED_TO_MAKER", doc.getDocIdCode(), checker,
                "Document returned to maker for changes by " + checker + " with remarks: " + remarks));

        return saved;
    }

    @Transactional
    public Document approveDocument(Long id, String checker, String remarks) {
        Document doc = documentRepository.findById(id).orElseThrow(() -> new RuntimeException("Document not found"));
        doc.setStatus("APPROVED");
        doc.setCheckerUsername(checker);
        doc.setCheckerRemarks(remarks);
        doc.setUpdatedAt(LocalDateTime.now());

        Document saved = documentRepository.save(doc);

        auditLogRepository.save(new AuditLog("APPROVAL", doc.getDocIdCode(), checker,
                "Document approved by " + checker + " with remarks: " + remarks));

        return saved;
    }

    @Transactional
    public Document rejectDocument(Long id, String checker, String remarks) {
        Document doc = documentRepository.findById(id).orElseThrow(() -> new RuntimeException("Document not found"));
        doc.setStatus("REJECTED");
        doc.setCheckerUsername(checker);
        doc.setCheckerRemarks(remarks);
        doc.setUpdatedAt(LocalDateTime.now());

        Document saved = documentRepository.save(doc);

        auditLogRepository.save(new AuditLog("REJECTION", doc.getDocIdCode(), checker,
                "Document rejected by " + checker + " with remarks: " + remarks));

        return saved;
    }

    @Transactional
    public void processDocumentFile(File file, String processingSummary) {
        // Automatically check if there is an active matching document or create a new one dynamically
        String name = file.getName();
        // Pick app code
        String appCode = userService.getConfig("DEFAULT_APP_CODE", "SDE");

        // Try to guess Phase from filename, e.g. "Phase1_BusinessCase.xlsx" or "P101.docx" or default to 1
        int phase = 1;
        for (int p = 1; p <= 7; p++) {
            if (name.toLowerCase().contains("phase" + p) || name.toLowerCase().contains("p" + p)) {
                phase = p;
                break;
            }
        }

        String[] titles = PHASE_TITLES.get(phase);
        String title = (titles != null && titles.length > 0) ? titles[0] : "System Document";

        Document doc = createDocument(appCode, phase, title, "Automatically picked up and processed document",
                "1.0", "AUTO_PICKUP", "SYSTEM", name, file.getAbsolutePath());

        doc.setProcessedStatus("PROCESSED");
        doc.setRecommendations("[AI recommendations simulated] Verified layout format and standard schema configuration.");
        documentRepository.save(doc);

        auditLogRepository.save(new AuditLog("PROCESSED", doc.getDocIdCode(), "SYSTEM",
                "Successfully processed document file automatically from folder polling. Summary: " + processingSummary));
    }

    public List<AuditLog> getAuditLogsForDoc(String docIdCode) {
        return auditLogRepository.findByDocIdCodeOrderByLogTimestampDesc(docIdCode);
    }
}
