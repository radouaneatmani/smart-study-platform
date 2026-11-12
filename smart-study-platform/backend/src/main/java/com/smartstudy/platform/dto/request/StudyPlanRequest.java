package com.smartstudy.platform.dto.request;

import java.time.LocalDate;

public class StudyPlanRequest {
    private String subjectId;
    private LocalDate examDate;
    private int availableHoursPerWeek;

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public LocalDate getExamDate() { return examDate; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }

    public int getAvailableHoursPerWeek() { return availableHoursPerWeek; }
    public void setAvailableHoursPerWeek(int availableHoursPerWeek) { this.availableHoursPerWeek = availableHoursPerWeek; }
}
