package com.smartstudy.platform.dto.response;

import java.util.List;

public class SummaryResponse {
    private String shortSummary;
    private String detailedSummary;
    private List<String> keyConcepts;

    public SummaryResponse() {}

    public SummaryResponse(String shortSummary, String detailedSummary, List<String> keyConcepts) {
        this.shortSummary = shortSummary;
        this.detailedSummary = detailedSummary;
        this.keyConcepts = keyConcepts;
    }

    public String getShortSummary() { return shortSummary; }
    public void setShortSummary(String shortSummary) { this.shortSummary = shortSummary; }

    public String getDetailedSummary() { return detailedSummary; }
    public void setDetailedSummary(String detailedSummary) { this.detailedSummary = detailedSummary; }

    public List<String> getKeyConcepts() { return keyConcepts; }
    public void setKeyConcepts(List<String> keyConcepts) { this.keyConcepts = keyConcepts; }
}
