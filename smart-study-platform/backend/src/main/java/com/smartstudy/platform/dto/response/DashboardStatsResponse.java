package com.smartstudy.platform.dto.response;

import java.util.List;
import java.util.Map;

public class DashboardStatsResponse {
    private long totalDocuments;
    private long totalQuizzes;
    private long totalQuizAttempts;
    private double averageQuizScore;
    private long totalFlashcards;
    private long masteredFlashcards;
    private long learningFlashcards;
    private long totalNotes;
    private long totalSubjects;
    private long aiRequestsCount;
    private int estimatedStudyHours;
    private List<Map<String, Object>> recentQuizScores;
    private List<Map<String, Object>> subjectsDistribution;

    public DashboardStatsResponse() {}

    public long getTotalDocuments() { return totalDocuments; }
    public void setTotalDocuments(long totalDocuments) { this.totalDocuments = totalDocuments; }

    public long getTotalQuizzes() { return totalQuizzes; }
    public void setTotalQuizzes(long totalQuizzes) { this.totalQuizzes = totalQuizzes; }

    public long getTotalQuizAttempts() { return totalQuizAttempts; }
    public void setTotalQuizAttempts(long totalQuizAttempts) { this.totalQuizAttempts = totalQuizAttempts; }

    public double getAverageQuizScore() { return averageQuizScore; }
    public void setAverageQuizScore(double averageQuizScore) { this.averageQuizScore = averageQuizScore; }

    public long getTotalFlashcards() { return totalFlashcards; }
    public void setTotalFlashcards(long totalFlashcards) { this.totalFlashcards = totalFlashcards; }

    public long getMasteredFlashcards() { return masteredFlashcards; }
    public void setMasteredFlashcards(long masteredFlashcards) { this.masteredFlashcards = masteredFlashcards; }

    public long getLearningFlashcards() { return learningFlashcards; }
    public void setLearningFlashcards(long learningFlashcards) { this.learningFlashcards = learningFlashcards; }

    public long getTotalNotes() { return totalNotes; }
    public void setTotalNotes(long totalNotes) { this.totalNotes = totalNotes; }

    public long getTotalSubjects() { return totalSubjects; }
    public void setTotalSubjects(long totalSubjects) { this.totalSubjects = totalSubjects; }

    public long getAiRequestsCount() { return aiRequestsCount; }
    public void setAiRequestsCount(long aiRequestsCount) { this.aiRequestsCount = aiRequestsCount; }

    public int getEstimatedStudyHours() { return estimatedStudyHours; }
    public void setEstimatedStudyHours(int estimatedStudyHours) { this.estimatedStudyHours = estimatedStudyHours; }

    public List<Map<String, Object>> getRecentQuizScores() { return recentQuizScores; }
    public void setRecentQuizScores(List<Map<String, Object>> recentQuizScores) { this.recentQuizScores = recentQuizScores; }

    public List<Map<String, Object>> getSubjectsDistribution() { return subjectsDistribution; }
    public void setSubjectsDistribution(List<Map<String, Object>> subjectsDistribution) { this.subjectsDistribution = subjectsDistribution; }
}
