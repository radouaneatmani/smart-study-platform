package com.smartstudy.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class NoteRequest {
    @NotBlank
    private String title;
    private String content;
    private String subjectId;
    private String folder;
    private List<String> tags;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getFolder() { return folder; }
    public void setFolder(String folder) { this.folder = folder; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
}
