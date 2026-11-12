package com.smartstudy.platform.controller;

import com.smartstudy.platform.dto.request.NoteRequest;
import com.smartstudy.platform.dto.response.MessageResponse;
import com.smartstudy.platform.model.Note;
import com.smartstudy.platform.repository.NoteRepository;
import com.smartstudy.platform.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    @Autowired
    private NoteRepository noteRepository;

    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                                  @RequestParam(required = false) String subjectId,
                                                  @RequestParam(required = false) String folder) {
        if (subjectId != null && !subjectId.isBlank()) {
            return ResponseEntity.ok(noteRepository.findByUserIdAndSubjectIdOrderByUpdatedAtDesc(userDetails.getId(), subjectId));
        }
        if (folder != null && !folder.isBlank()) {
            return ResponseEntity.ok(noteRepository.findByUserIdAndFolderOrderByUpdatedAtDesc(userDetails.getId(), folder));
        }
        return ResponseEntity.ok(noteRepository.findByUserIdOrderByUpdatedAtDesc(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNoteById(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable String id) {
        Note note = noteRepository.findById(id).orElse(null);
        if (note == null || !note.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(note);
    }

    @PostMapping
    public ResponseEntity<?> createNote(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                        @Valid @RequestBody NoteRequest request) {
        Note note = new Note();
        note.setUserId(userDetails.getId());
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setSubjectId(request.getSubjectId());
        note.setFolder(request.getFolder() != null ? request.getFolder() : "General");
        note.setTags(request.getTags());
        note.setCreatedAt(LocalDateTime.now());
        note.setUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(noteRepository.save(note));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateNote(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                        @PathVariable String id,
                                        @Valid @RequestBody NoteRequest request) {
        Note note = noteRepository.findById(id).orElse(null);
        if (note == null || !note.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setSubjectId(request.getSubjectId());
        if (request.getFolder() != null) note.setFolder(request.getFolder());
        if (request.getTags() != null) note.setTags(request.getTags());
        note.setUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(noteRepository.save(note));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                        @PathVariable String id) {
        Note note = noteRepository.findById(id).orElse(null);
        if (note == null || !note.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.notFound().build();
        }
        noteRepository.delete(note);
        return ResponseEntity.ok(new MessageResponse("Note supprimée avec succès"));
    }
}
