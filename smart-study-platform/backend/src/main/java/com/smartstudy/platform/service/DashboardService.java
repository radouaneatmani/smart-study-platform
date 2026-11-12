package com.smartstudy.platform.service;

import com.smartstudy.platform.dto.response.DashboardStatsResponse;
import com.smartstudy.platform.model.Flashcard;
import com.smartstudy.platform.model.QuizAttempt;
import com.smartstudy.platform.model.Subject;
import com.smartstudy.platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    @Autowired
    private StudyDocumentRepository documentRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private FlashcardRepository flashcardRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public DashboardStatsResponse getUserStats(String userId) {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        long totalDocs = documentRepository.countByUserId(userId);
        long totalQuizzes = quizRepository.countByUserId(userId);
        long totalNotes = noteRepository.countByUserId(userId);
        long totalSubjects = subjectRepository.countByUserId(userId);

        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdOrderByCompletedAtDesc(userId);
        long totalAttempts = attempts.size();
        double avgScore = attempts.isEmpty() ? 0.0 :
                attempts.stream().mapToDouble(QuizAttempt::getPercentage).average().orElse(0.0);

        List<Flashcard> flashcards = flashcardRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long totalCards = flashcards.size();
        long masteredCards = flashcards.stream().filter(f -> "MASTERED".equals(f.getMasteryStatus())).count();
        long learningCards = flashcards.stream().filter(f -> "LEARNING".equals(f.getMasteryStatus())).count();

        long aiRequests = chatMessageRepository.countByUserIdAndRole(userId, "user");

        int estimatedMinutes = (int) (totalDocs * 25 + totalAttempts * 12 + totalCards * 3 + totalNotes * 15);
        int estimatedHours = Math.max(1, estimatedMinutes / 60);

        stats.setTotalDocuments(totalDocs);
        stats.setTotalQuizzes(totalQuizzes);
        stats.setTotalQuizAttempts(totalAttempts);
        stats.setAverageQuizScore(Math.round(avgScore * 10.0) / 10.0);
        stats.setTotalFlashcards(totalCards);
        stats.setMasteredFlashcards(masteredCards);
        stats.setLearningFlashcards(learningCards);
        stats.setTotalNotes(totalNotes);
        stats.setTotalSubjects(totalSubjects);
        stats.setAiRequestsCount(aiRequests + totalDocs * 2 + totalQuizzes);
        stats.setEstimatedStudyHours(estimatedHours);

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM");
        List<Map<String, Object>> recentScores = attempts.stream().limit(7).map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("quizTitle", a.getQuizTitle());
            map.put("score", a.getPercentage());
            map.put("date", a.getCompletedAt() != null ? a.getCompletedAt().format(dtf) : "Recente");
            return map;
        }).collect(Collectors.toList());
        Collections.reverse(recentScores);
        stats.setRecentQuizScores(recentScores);

        List<Subject> subjects = subjectRepository.findByUserIdOrderByNameAsc(userId);
        List<Map<String, Object>> subjectsDist = new ArrayList<>();
        for (Subject s : subjects) {
            long docCount = documentRepository.findByUserIdAndSubjectIdOrderByCreatedAtDesc(userId, s.getId()).size();
            long cardCount = flashcardRepository.findByUserIdAndSubjectIdOrderByCreatedAtDesc(userId, s.getId()).size();
            Map<String, Object> map = new HashMap<>();
            map.put("subjectName", s.getName());
            map.put("color", s.getColor());
            map.put("documentsCount", docCount);
            map.put("flashcardsCount", cardCount);
            subjectsDist.add(map);
        }
        stats.setSubjectsDistribution(subjectsDist);

        return stats;
    }
}
