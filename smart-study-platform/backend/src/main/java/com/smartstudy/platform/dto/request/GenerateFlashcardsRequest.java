package com.smartstudy.platform.dto.request;

public class GenerateFlashcardsRequest {
    private String documentId;
    private String subjectId;
    private String topic;
    private int cardCount = 6;

    public String getDocumentId() { return documentId; }
    public void setDocumentId(String documentId) { this.documentId = documentId; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public int getCardCount() { return cardCount; }
    public void setCardCount(int cardCount) { this.cardCount = cardCount; }
}
