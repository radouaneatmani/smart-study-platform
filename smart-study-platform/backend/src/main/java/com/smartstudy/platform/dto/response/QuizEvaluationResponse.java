package com.smartstudy.platform.dto.response;

import com.smartstudy.platform.model.QuizAttempt;
import java.util.List;

public class QuizEvaluationResponse {
    private QuizAttempt attempt;
    private List<Integer> correctAnswers;
    private List<String> explanations;
    private String feedback;

    public QuizEvaluationResponse(QuizAttempt attempt, List<Integer> correctAnswers, List<String> explanations, String feedback) {
        this.attempt = attempt;
        this.correctAnswers = correctAnswers;
        this.explanations = explanations;
        this.feedback = feedback;
    }

    public QuizAttempt getAttempt() { return attempt; }
    public void setAttempt(QuizAttempt attempt) { this.attempt = attempt; }

    public List<Integer> getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(List<Integer> correctAnswers) { this.correctAnswers = correctAnswers; }

    public List<String> getExplanations() { return explanations; }
    public void setExplanations(List<String> explanations) { this.explanations = explanations; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}
