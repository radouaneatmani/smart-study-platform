package com.smartstudy.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "study_plans")
public class StudyPlan {
    @Id
    private String id;
    private String userId;
    private String subjectId;
    private String subjectName;
    private String title;
    private LocalDate examDate;
    private int availableHoursPerWeek;
    private int totalDaysRemaining;
    private String strategicAdvice;
    private List<StudySession> sessions = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();

    public StudyPlan() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDate getExamDate() { return examDate; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }

    public int getAvailableHoursPerWeek() { return availableHoursPerWeek; }
    public void setAvailableHoursPerWeek(int availableHoursPerWeek) { this.availableHoursPerWeek = availableHoursPerWeek; }

    public int getTotalDaysRemaining() { return totalDaysRemaining; }
    public void setTotalDaysRemaining(int totalDaysRemaining) { this.totalDaysRemaining = totalDaysRemaining; }

    public String getStrategicAdvice() { return strategicAdvice; }
    public void setStrategicAdvice(String strategicAdvice) { this.strategicAdvice = strategicAdvice; }

    public List<StudySession> getSessions() { return sessions; }
    public void setSessions(List<StudySession> sessions) { this.sessions = sessions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
