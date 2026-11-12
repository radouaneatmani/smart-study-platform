package com.smartstudy.platform.repository;

import com.smartstudy.platform.model.Flashcard;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardRepository extends MongoRepository<Flashcard, String> {
    List<Flashcard> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Flashcard> findByUserIdAndSubjectIdOrderByCreatedAtDesc(String userId, String subjectId);
    List<Flashcard> findByUserIdAndMasteryStatus(String userId, String masteryStatus);
    long countByUserId(String userId);
}
