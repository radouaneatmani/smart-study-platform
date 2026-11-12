package com.smartstudy.platform.dto.request;

import java.util.List;

public class SubmitQuizRequest {
    private String quizId;
    private List<Integer> selectedAnswers;

    public String getQuizId() { return quizId; }
    public void setQuizId(String quizId) { this.quizId = quizId; }

    public List<Integer> getSelectedAnswers() { return selectedAnswers; }
    public void setSelectedAnswers(List<Integer> selectedAnswers) { this.selectedAnswers = selectedAnswers; }
}
