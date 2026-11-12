package com.smartstudy.platform.dto.request;

public class TutorChatRequest {
    private String message;
    private String documentId;
    private String subjectId;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getDocumentId() { return documentId; }
    public void setDocumentId(String documentId) { this.documentId = documentId; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }
}
