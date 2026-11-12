package com.smartstudy.platform.controller;

import com.smartstudy.platform.dto.request.GenerateSummaryRequest;
import com.smartstudy.platform.dto.request.StudyPlanRequest;
import com.smartstudy.platform.dto.request.TutorChatRequest;
import com.smartstudy.platform.dto.response.MessageResponse;
import com.smartstudy.platform.dto.response.SummaryResponse;
import com.smartstudy.platform.model.*;
import com.smartstudy.platform.repository.*;
import com.smartstudy.platform.security.UserDetailsImpl;
import com.smartstudy.platform.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    @Autowired
    private AiService aiService;

    @Autowired
    private StudyDocumentRepository documentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private StudyPlanRepository studyPlanRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/summarize")
    public ResponseEntity<?> summarizeText(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                           @RequestBody GenerateSummaryRequest request) {
        String textToAnalyze = request.getText();
        if (request.getDocumentId() != null && !request.getDocumentId().isBlank()) {
            StudyDocument doc = documentRepository.findById(request.getDocumentId()).orElse(null);
            if (doc != null && doc.getExtractedText() != null) {
                textToAnalyze = doc.getExtractedText();
            }
        }

        if (textToAnalyze == null || textToAnalyze.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Aucun texte fourni à résumer", false));
        }

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        String userApiKey = user != null ? user.getGeminiApiKey() : null;

        SummaryResponse summary = aiService.generateSummary(textToAnalyze, userApiKey);

        // Si associé à un document existant, mettre à jour le document
        if (request.getDocumentId() != null && !request.getDocumentId().isBlank()) {
            StudyDocument doc = documentRepository.findById(request.getDocumentId()).orElse(null);
            if (doc != null && doc.getUserId().equals(userDetails.getId())) {
                doc.setShortSummary(summary.getShortSummary());
                doc.setDetailedSummary(summary.getDetailedSummary());
                doc.setKeyConcepts(summary.getKeyConcepts());
                documentRepository.save(doc);
            }
        }

        return ResponseEntity.ok(summary);
    }

    @PostMapping("/tutor")
    public ResponseEntity<?> chatWithTutor(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                           @RequestBody TutorChatRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Message vide", false));
        }

        // Sauvegarder le message utilisateur
        ChatMessage userMsg = new ChatMessage(
                userDetails.getId(),
                request.getSubjectId(),
                request.getDocumentId(),
                "user",
                request.getMessage()
        );
        chatMessageRepository.save(userMsg);

        // Obtenir le contexte du document
        String documentContext = "";
        if (request.getDocumentId() != null && !request.getDocumentId().isBlank()) {
            StudyDocument doc = documentRepository.findById(request.getDocumentId()).orElse(null);
            if (doc != null && doc.getExtractedText() != null) {
                documentContext = doc.getExtractedText();
            }
        }

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        String userApiKey = user != null ? user.getGeminiApiKey() : null;

        List<ChatMessage> history = chatMessageRepository.findByUserIdOrderByTimestampAsc(userDetails.getId());
        String responseContent = aiService.chatWithTutor(request.getMessage(), documentContext, history, userApiKey);

        // Sauvegarder la reponse du tuteur
        ChatMessage botMsg = new ChatMessage(
                userDetails.getId(),
                request.getSubjectId(),
                request.getDocumentId(),
                "assistant",
                responseContent
        );
        ChatMessage savedBotMsg = chatMessageRepository.save(botMsg);

        return ResponseEntity.ok(savedBotMsg);
    }

    @GetMapping("/tutor/history")
    public ResponseEntity<List<ChatMessage>> getTutorHistory(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                             @RequestParam(required = false) String documentId,
                                                             @RequestParam(required = false) String subjectId) {
        if (documentId != null && !documentId.isBlank()) {
            return ResponseEntity.ok(chatMessageRepository.findByUserIdAndDocumentIdOrderByTimestampAsc(userDetails.getId(), documentId));
        }
        if (subjectId != null && !subjectId.isBlank()) {
            return ResponseEntity.ok(chatMessageRepository.findByUserIdAndSubjectIdOrderByTimestampAsc(userDetails.getId(), subjectId));
        }
        return ResponseEntity.ok(chatMessageRepository.findByUserIdOrderByTimestampAsc(userDetails.getId()));
    }

    @PostMapping("/study-plan")
    public ResponseEntity<?> generateStudyPlan(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                               @RequestBody StudyPlanRequest request) {
        String subjectName = "Matière Principale";
        if (request.getSubjectId() != null && !request.getSubjectId().isBlank()) {
            Subject sub = subjectRepository.findById(request.getSubjectId()).orElse(null);
            if (sub != null) subjectName = sub.getName();
        }

        StudyPlan plan = aiService.generateStudyPlan(
                userDetails.getId(),
                request.getSubjectId(),
                subjectName,
                request.getExamDate(),
                request.getAvailableHoursPerWeek()
        );

        StudyPlan saved = studyPlanRepository.save(plan);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/study-plan")
    public ResponseEntity<List<StudyPlan>> getStudyPlans(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(studyPlanRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    @PutMapping("/study-plan/{planId}/sessions/{sessionId}")
    public ResponseEntity<?> toggleSessionComplete(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                   @PathVariable String planId,
                                                   @PathVariable String sessionId) {
        StudyPlan plan = studyPlanRepository.findById(planId).orElse(null);
        if (plan == null || !plan.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }

        for (StudySession s : plan.getSessions()) {
            if (s.getId().equals(sessionId)) {
                s.setCompleted(!s.isCompleted());
                break;
            }
        }

        studyPlanRepository.save(plan);
        return ResponseEntity.ok(plan);
    }
}
