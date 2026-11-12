package com.smartstudy.platform.controller;

import com.smartstudy.platform.dto.response.MessageResponse;
import com.smartstudy.platform.dto.response.SummaryResponse;
import com.smartstudy.platform.model.StudyDocument;
import com.smartstudy.platform.model.User;
import com.smartstudy.platform.repository.StudyDocumentRepository;
import com.smartstudy.platform.repository.UserRepository;
import com.smartstudy.platform.security.UserDetailsImpl;
import com.smartstudy.platform.service.AiService;
import com.smartstudy.platform.service.DocumentParserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    @Autowired
    private StudyDocumentRepository documentRepository;

    @Autowired
    private DocumentParserService parserService;

    @Autowired
    private AiService aiService;

    @Autowired
    private UserRepository userRepository;

    @Value("${smartstudy.upload.dir:./uploads}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<List<StudyDocument>> getAllDocuments(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                               @RequestParam(required = false) String subjectId) {
        if (subjectId != null && !subjectId.isBlank()) {
            return ResponseEntity.ok(documentRepository.findByUserIdAndSubjectIdOrderByCreatedAtDesc(userDetails.getId(), subjectId));
        }
        return ResponseEntity.ok(documentRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDocumentById(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                             @PathVariable String id) {
        StudyDocument doc = documentRepository.findById(id).orElse(null);
        if (doc == null || !doc.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(doc);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                            @RequestParam("file") MultipartFile file,
                                            @RequestParam(value = "title", required = false) String title,
                                            @RequestParam(value = "subjectId", required = false) String subjectId,
                                            @RequestParam(value = "generateAiSummary", defaultValue = "true") boolean generateAiSummary) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Fichier vide", false));
            }

            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf(".")).toUpperCase();
            }

            // Sauvegarde du fichier sur disque
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String storedFileName = UUID.randomUUID().toString() + "_" + originalName;
            Path filePath = uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), filePath);

            // Extraction de texte
            String extractedText = parserService.extractText(file);

            StudyDocument doc = new StudyDocument();
            doc.setUserId(userDetails.getId());
            doc.setSubjectId(subjectId);
            doc.setTitle(title != null && !title.isBlank() ? title : (originalName != null ? originalName : "Document"));
            doc.setFileName(originalName);
            doc.setFileType(extension.replace(".", ""));
            doc.setFileSize(file.getSize());
            doc.setStoragePath(filePath.toString());
            doc.setExtractedText(extractedText);
            doc.setCreatedAt(LocalDateTime.now());

            // Generation de resume IA initial si demande
            if (generateAiSummary && extractedText != null && !extractedText.isBlank()) {
                User user = userRepository.findById(userDetails.getId()).orElse(null);
                String userApiKey = user != null ? user.getGeminiApiKey() : null;
                SummaryResponse summary = aiService.generateSummary(extractedText, userApiKey);
                doc.setShortSummary(summary.getShortSummary());
                doc.setDetailedSummary(summary.getDetailedSummary());
                doc.setKeyConcepts(summary.getKeyConcepts());
            }

            StudyDocument saved = documentRepository.save(doc);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur lors du traitement du document: " + e.getMessage(), false));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                            @PathVariable String id) {
        StudyDocument doc = documentRepository.findById(id).orElse(null);
        if (doc == null || !doc.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }

        try {
            if (doc.getStoragePath() != null) {
                File f = new File(doc.getStoragePath());
                if (f.exists()) f.delete();
            }
        } catch (Exception ignored) {}

        documentRepository.delete(doc);
        return ResponseEntity.ok(new MessageResponse("Document supprimé avec succès"));
    }
}
