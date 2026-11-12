package com.smartstudy.platform.dto.request;

public class GenerateSummaryRequest {
    private String documentId;
    private String text;
    private String type; // "SHORT", "DETAILED", "KEY_CONCEPTS", "ALL"

    public String getDocumentId() { return documentId; }
    public void setDocumentId(String documentId) { this.documentId = documentId; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
