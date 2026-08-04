package com.cth.sdm;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class DocumentServiceTest {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private DocumentRepository documentRepository;

    @BeforeEach
    public void setup() {
        documentRepository.deleteAll();
    }

    @Test
    public void testCreateDocumentAndCheckIdSequence() {
        // First upload for phase 1
        Document doc1 = documentService.createDocument("SDE", 1, "Business Case", "Desc 1", "1.0", "BC-01", "maker", "file1.docx", "/path/file1.docx");
        assertEquals("SDE-P101", doc1.getDocIdCode());
        assertEquals("PENDING", doc1.getStatus());

        // Second upload for phase 1 should increment to P102
        Document doc2 = documentService.createDocument("SDE", 1, "Project Charter", "Desc 2", "1.0", "PC-01", "maker", "file2.docx", "/path/file2.docx");
        assertEquals("SDE-P102", doc2.getDocIdCode());

        // First upload for phase 2 should start at P201
        Document doc3 = documentService.createDocument("SDE", 2, "Functional Specification Document", "Desc 3", "1.0", "FS-01", "maker", "file3.docx", "/path/file3.docx");
        assertEquals("SDE-P201", doc3.getDocIdCode());
    }

    @Test
    public void testMakerCheckerDoubleAuthWorkflow() {
        Document doc = documentService.createDocument("SDE", 1, "Business Case", "Verification", "1.0", "BC-01", "maker", "file.docx", "/path/file.docx");
        assertEquals("PENDING", doc.getStatus());

        // Approval flow
        Document approvedDoc = documentService.approveDocument(doc.getId(), "checker", "Approved with high marks");
        assertEquals("APPROVED", approvedDoc.getStatus());
        assertEquals("checker", approvedDoc.getCheckerUsername());
        assertEquals("Approved with high marks", approvedDoc.getCheckerRemarks());

        // Rejection check
        Document doc2 = documentService.createDocument("SDE", 2, "Use Case", "Audit test", "1.0", "UC-01", "maker", "file2.docx", "/path/file2.docx");
        Document rejectedDoc = documentService.rejectDocument(doc2.getId(), "checker", "Need formatting changes");
        assertEquals("REJECTED", rejectedDoc.getStatus());
    }
}
