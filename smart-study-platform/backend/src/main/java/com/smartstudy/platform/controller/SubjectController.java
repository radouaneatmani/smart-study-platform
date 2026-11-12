package com.smartstudy.platform.controller;

import com.smartstudy.platform.dto.request.SubjectRequest;
import com.smartstudy.platform.dto.response.MessageResponse;
import com.smartstudy.platform.model.Subject;
import com.smartstudy.platform.repository.SubjectRepository;
import com.smartstudy.platform.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    @Autowired
    private SubjectRepository subjectRepository;

    @GetMapping
    public ResponseEntity<List<Subject>> getAllSubjects(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(subjectRepository.findByUserIdOrderByNameAsc(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createSubject(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                           @Valid @RequestBody SubjectRequest request) {
        Subject subject = new Subject(
                userDetails.getId(),
                request.getName(),
                request.getDescription(),
                request.getColor(),
                request.getIcon()
        );
        return ResponseEntity.ok(subjectRepository.save(subject));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubject(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                           @PathVariable String id,
                                           @Valid @RequestBody SubjectRequest request) {
        Subject subject = subjectRepository.findById(id).orElse(null);
        if (subject == null || !subject.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }
        subject.setName(request.getName());
        subject.setDescription(request.getDescription());
        if (request.getColor() != null) subject.setColor(request.getColor());
        if (request.getIcon() != null) subject.setIcon(request.getIcon());

        return ResponseEntity.ok(subjectRepository.save(subject));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubject(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                           @PathVariable String id) {
        Subject subject = subjectRepository.findById(id).orElse(null);
        if (subject == null || !subject.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }
        subjectRepository.delete(subject);
        return ResponseEntity.ok(new MessageResponse("Matière supprimée avec succès"));
    }
}
