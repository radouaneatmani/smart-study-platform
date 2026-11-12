package com.smartstudy.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "documents")
public class StudyDocument {
    @Id
    private String id;
    private String userId;
    private String subjectId;
    private String title;
    private String fileName;
    private String fileType;
    private long fileSize;
    private String storagePath;
    private String extractedText;
    private String shortSummary;
    private String detailedSummary;
    private List<String> keyConcepts = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();

    public StudyDocument() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }

    public String getShortSummary() { return shortSummary; }
    public void setShortSummary(String shortSummary) { this.shortSummary = shortSummary; }

    public String getDetailedSummary() { return detailedSummary; }
    public void setDetailedSummary(String detailedSummary) { this.detailedSummary = detailedSummary; }

    public List<String> getKeyConcepts() { return keyConcepts; }
    public void setKeyConcepts(List<String> keyConcepts) { this.keyConcepts = keyConcepts; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
