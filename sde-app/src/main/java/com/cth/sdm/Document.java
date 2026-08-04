package com.cth.sdm;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doc_id_code", unique = true, nullable = false)
    private String docIdCode; // SDE-P101, SDE-P201, etc.

    @Column(name = "app_code", nullable = false)
    private String appCode;

    @Column(name = "phase_number", nullable = false)
    private Integer phaseNumber;

    @Column(name = "document_title", nullable = false)
    private String documentTitle;

    @Column(nullable = false)
    private String description;

    @Column(name = "version_number", nullable = false)
    private String versionNumber;

    @Column(name = "document_code", nullable = false)
    private String documentCode;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "file_name")
    private String fileName;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, PROCESSED

    @Column(name = "maker_username", nullable = false)
    private String makerUsername;

    @Column(name = "checker_username")
    private String checkerUsername;

    @Column(name = "checker_remarks")
    private String checkerRemarks;

    @Column(name = "processed_status", nullable = false)
    private String processedStatus = "NOT PROCESSED"; // PROCESSED, NOT PROCESSED

    @Lob
    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Document() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDocIdCode() { return docIdCode; }
    public void setDocIdCode(String docIdCode) { this.docIdCode = docIdCode; }

    public String getAppCode() { return appCode; }
    public void setAppCode(String appCode) { this.appCode = appCode; }

    public Integer getPhaseNumber() { return phaseNumber; }
    public void setPhaseNumber(Integer phaseNumber) { this.phaseNumber = phaseNumber; }

    public String getDocumentTitle() { return documentTitle; }
    public void setDocumentTitle(String documentTitle) { this.documentTitle = documentTitle; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getVersionNumber() { return versionNumber; }
    public void setVersionNumber(String versionNumber) { this.versionNumber = versionNumber; }

    public String getDocumentCode() { return documentCode; }
    public void setDocumentCode(String documentCode) { this.documentCode = documentCode; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMakerUsername() { return makerUsername; }
    public void setMakerUsername(String makerUsername) { this.makerUsername = makerUsername; }

    public String getCheckerUsername() { return checkerUsername; }
    public void setCheckerUsername(String checkerUsername) { this.checkerUsername = checkerUsername; }

    public String getCheckerRemarks() { return checkerRemarks; }
    public void setCheckerRemarks(String checkerRemarks) { this.checkerRemarks = checkerRemarks; }

    public String getProcessedStatus() { return processedStatus; }
    public void setProcessedStatus(String processedStatus) { this.processedStatus = processedStatus; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
