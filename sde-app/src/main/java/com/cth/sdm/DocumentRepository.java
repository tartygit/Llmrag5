package com.cth.sdm;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByAppCode(String appCode);
    List<Document> findByStatus(String status);
    List<Document> findByPhaseNumber(Integer phaseNumber);
}
