package com.smartstudy.platform.controller;

import com.smartstudy.platform.dto.request.FlashcardRequest;
import com.smartstudy.platform.dto.request.GenerateFlashcardsRequest;
import com.smartstudy.platform.dto.response.MessageResponse;
import com.smartstudy.platform.model.Flashcard;
import com.smartstudy.platform.model.StudyDocument;
import com.smartstudy.platform.model.User;
import com.smartstudy.platform.repository.FlashcardRepository;
import com.smartstudy.platform.repository.StudyDocumentRepository;
import com.smartstudy.platform.repository.UserRepository;
import com.smartstudy.platform.security.UserDetailsImpl;
import com.smartstudy.platform.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {
    @Autowired
    private FlashcardRepository flashcardRepository;

    @Autowired
    private StudyDocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiService aiService;

    @GetMapping
    public ResponseEntity<List<Flashcard>> getAllFlashcards(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                            @RequestParam(required = false) String subjectId,
                                                            @RequestParam(required = false) String masteryStatus) {
        if (masteryStatus != null && !masteryStatus.isBlank()) {
            return ResponseEntity.ok(flashcardRepository.findByUserIdAndMasteryStatus(userDetails.getId(), masteryStatus));
        }
        if (subjectId != null && !subjectId.isBlank()) {
            return ResponseEntity.ok(flashcardRepository.findByUserIdAndSubjectIdOrderByCreatedAtDesc(userDetails.getId(), subjectId));
        }
        return ResponseEntity.ok(flashcardRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createFlashcard(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                             @RequestBody FlashcardRequest request) {
        Flashcard fc = new Flashcard(
                userDetails.getId(),
                request.getSubjectId(),
                request.getDocumentId(),
                request.getFront(),
                request.getBack()
        );
        if (request.getDifficulty() != null) fc.setDifficulty(request.getDifficulty());
        if (request.getMasteryStatus() != null) fc.setMasteryStatus(request.getMasteryStatus());
        return ResponseEntity.ok(flashcardRepository.save(fc));
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateFlashcards(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                @RequestBody GenerateFlashcardsRequest request) {
        String contextText = "";
        if (request.getDocumentId() != null && !request.getDocumentId().isBlank()) {
            StudyDocument doc = documentRepository.findById(request.getDocumentId()).orElse(null);
            if (doc != null && doc.getExtractedText() != null) {
                contextText = doc.getExtractedText();
            }
        }

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        String userApiKey = user != null ? user.getGeminiApiKey() : null;

        List<Flashcard> generated = aiService.generateFlashcards(
                userDetails.getId(),
                request.getSubjectId(),
                request.getDocumentId(),
                request.getTopic(),
                contextText,
                request.getCardCount(),
                userApiKey
        );

        List<Flashcard> saved = flashcardRepository.saveAll(generated);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateMasteryStatus(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                 @PathVariable String id,
                                                 @RequestParam String status) {
        Flashcard fc = flashcardRepository.findById(id).orElse(null);
        if (fc == null || !fc.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }

        fc.setMasteryStatus(status);
        fc.setReviewCount(fc.getReviewCount() + 1);
        // Calcul simple de répétition espacée
        if ("MASTERED".equals(status)) {
            fc.setNextReviewDate(LocalDateTime.now().plusDays(5));
        } else if ("LEARNING".equals(status)) {
            fc.setNextReviewDate(LocalDateTime.now().plusDays(2));
        } else {
            fc.setNextReviewDate(LocalDateTime.now().plusHours(12));
        }

        return ResponseEntity.ok(flashcardRepository.save(fc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFlashcard(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                             @PathVariable String id) {
        Flashcard fc = flashcardRepository.findById(id).orElse(null);
        if (fc == null || !fc.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }
        flashcardRepository.delete(fc);
        return ResponseEntity.ok(new MessageResponse("Flashcard supprimée avec succès"));
    }
}
