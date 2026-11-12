package com.smartstudy.platform.controller;

import com.smartstudy.platform.dto.request.GenerateQuizRequest;
import com.smartstudy.platform.dto.request.SubmitQuizRequest;
import com.smartstudy.platform.dto.response.MessageResponse;
import com.smartstudy.platform.dto.response.QuizEvaluationResponse;
import com.smartstudy.platform.model.*;
import com.smartstudy.platform.repository.*;
import com.smartstudy.platform.security.UserDetailsImpl;
import com.smartstudy.platform.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {
    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private StudyDocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiService aiService;

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                    @RequestParam(required = false) String subjectId) {
        if (subjectId != null && !subjectId.isBlank()) {
            return ResponseEntity.ok(quizRepository.findByUserIdAndSubjectIdOrderByCreatedAtDesc(userDetails.getId(), subjectId));
        }
        return ResponseEntity.ok(quizRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                         @PathVariable String id) {
        Quiz quiz = quizRepository.findById(id).orElse(null);
        if (quiz == null || !quiz.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(quiz);
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateQuiz(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                          @RequestBody GenerateQuizRequest request) {
        String contextText = "";
        String topic = request.getTopic();

        if (request.getDocumentId() != null && !request.getDocumentId().isBlank()) {
            StudyDocument doc = documentRepository.findById(request.getDocumentId()).orElse(null);
            if (doc != null) {
                if (doc.getExtractedText() != null) contextText = doc.getExtractedText();
                if (topic == null || topic.isBlank()) topic = doc.getTitle();
            }
        }

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        String userApiKey = user != null ? user.getGeminiApiKey() : null;

        List<QuizQuestion> questions = aiService.generateQuiz(topic, contextText, request.getQuestionCount(), userApiKey);

        Quiz quiz = new Quiz();
        quiz.setUserId(userDetails.getId());
        quiz.setSubjectId(request.getSubjectId());
        quiz.setDocumentId(request.getDocumentId());
        quiz.setTitle("Quiz : " + (topic != null ? topic : "Évaluation"));
        quiz.setDescription("Quiz généré par l'IA contenant " + questions.size() + " questions.");
        quiz.setQuestions(questions);
        quiz.setCreatedAt(LocalDateTime.now());

        Quiz saved = quizRepository.save(quiz);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                        @RequestBody SubmitQuizRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId()).orElse(null);
        if (quiz == null || !quiz.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }

        List<QuizQuestion> questions = quiz.getQuestions();
        List<Integer> userAnswers = request.getSelectedAnswers();
        int score = 0;
        List<Integer> correctAnswers = new ArrayList<>();
        List<String> explanations = new ArrayList<>();

        for (int i = 0; i < questions.size(); i++) {
            QuizQuestion q = questions.get(i);
            correctAnswers.add(q.getCorrectOptionIndex());
            explanations.add(q.getExplanation());

            if (userAnswers != null && i < userAnswers.size()) {
                if (userAnswers.get(i) != null && userAnswers.get(i) == q.getCorrectOptionIndex()) {
                    score++;
                }
            }
        }

        double percentage = Math.round(((double) score / questions.size() * 100.0) * 10.0) / 10.0;

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUserId(userDetails.getId());
        attempt.setQuizId(quiz.getId());
        attempt.setQuizTitle(quiz.getTitle());
        attempt.setScore(score);
        attempt.setTotalQuestions(questions.size());
        attempt.setPercentage(percentage);
        attempt.setSelectedAnswers(userAnswers);
        attempt.setCompletedAt(LocalDateTime.now());
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        String feedback = percentage >= 80 ? "Excellent travail ! Vous maîtrisez les concepts clés de ce cours." :
                percentage >= 50 ? "Bon résultat ! Prenez le temps de revoir les explications des questions manquées." :
                        "Continuez vos révisions avec les Flashcards pour renforcer vos acquis.";

        return ResponseEntity.ok(new QuizEvaluationResponse(savedAttempt, correctAnswers, explanations, feedback));
    }

    @GetMapping("/attempts")
    public ResponseEntity<List<QuizAttempt>> getAttempts(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                         @RequestParam(required = false) String quizId) {
        if (quizId != null && !quizId.isBlank()) {
            return ResponseEntity.ok(quizAttemptRepository.findByUserIdAndQuizIdOrderByCompletedAtDesc(userDetails.getId(), quizId));
        }
        return ResponseEntity.ok(quizAttemptRepository.findByUserIdOrderByCompletedAtDesc(userDetails.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                        @PathVariable String id) {
        Quiz quiz = quizRepository.findById(id).orElse(null);
        if (quiz == null || !quiz.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }
        quizRepository.delete(quiz);
        return ResponseEntity.ok(new MessageResponse("Quiz supprimé"));
    }
}
