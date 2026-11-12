package com.smartstudy.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "flashcards")
public class Flashcard {
    @Id
    private String id;
    private String userId;
    private String subjectId;
    private String documentId;
    private String front;
    private String back;
    private String difficulty = "MEDIUM"; // EASY, MEDIUM, HARD
    private String masteryStatus = "NEW"; // NEW, LEARNING, MASTERED
    private int reviewCount = 0;
    private LocalDateTime nextReviewDate = LocalDateTime.now();
    private LocalDateTime createdAt = LocalDateTime.now();

    public Flashcard() {}

    public Flashcard(String userId, String subjectId, String documentId, String front, String back) {
        this.userId = userId;
        this.subjectId = subjectId;
        this.documentId = documentId;
        this.front = front;
        this.back = back;
        this.masteryStatus = "NEW";
        this.createdAt = LocalDateTime.now();
        this.nextReviewDate = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getDocumentId() { return documentId; }
    public void setDocumentId(String documentId) { this.documentId = documentId; }

    public String getFront() { return front; }
    public void setFront(String front) { this.front = front; }

    public String getBack() { return back; }
    public void setBack(String back) { this.back = back; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getMasteryStatus() { return masteryStatus; }
    public void setMasteryStatus(String masteryStatus) { this.masteryStatus = masteryStatus; }

    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }

    public LocalDateTime getNextReviewDate() { return nextReviewDate; }
    public void setNextReviewDate(LocalDateTime nextReviewDate) { this.nextReviewDate = nextReviewDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
