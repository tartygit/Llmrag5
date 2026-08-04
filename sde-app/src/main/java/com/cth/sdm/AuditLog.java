package com.cth.sdm;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "action_type", nullable = false)
    private String actionType; // UPLOAD, APPROVAL, REJECTION, etc.

    @Column(name = "doc_id_code")
    private String docIdCode;

    @Column(name = "performed_by", nullable = false)
    private String performedBy;

    @Column(length = 1000)
    private String details;

    @Column(name = "log_timestamp", nullable = false)
    private LocalDateTime logTimestamp = LocalDateTime.now();

    public AuditLog() {}

    public AuditLog(String actionType, String docIdCode, String performedBy, String details) {
        this.actionType = actionType;
        this.docIdCode = docIdCode;
        this.performedBy = performedBy;
        this.details = details;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getDocIdCode() { return docIdCode; }
    public void setDocIdCode(String docIdCode) { this.docIdCode = docIdCode; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getLogTimestamp() { return logTimestamp; }
    public void setLogTimestamp(LocalDateTime logTimestamp) { this.logTimestamp = logTimestamp; }
}
