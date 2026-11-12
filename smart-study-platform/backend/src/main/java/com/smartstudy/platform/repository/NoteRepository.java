package com.smartstudy.platform.repository;

import com.smartstudy.platform.model.Note;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends MongoRepository<Note, String> {
    List<Note> findByUserIdOrderByUpdatedAtDesc(String userId);
    List<Note> findByUserIdAndSubjectIdOrderByUpdatedAtDesc(String userId, String subjectId);
    List<Note> findByUserIdAndFolderOrderByUpdatedAtDesc(String userId, String folder);
    long countByUserId(String userId);
}
