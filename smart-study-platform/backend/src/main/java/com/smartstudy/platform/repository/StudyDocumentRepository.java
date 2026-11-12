package com.smartstudy.platform.repository;

import com.smartstudy.platform.model.StudyDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyDocumentRepository extends MongoRepository<StudyDocument, String> {
    List<StudyDocument> findByUserIdOrderByCreatedAtDesc(String userId);
    List<StudyDocument> findByUserIdAndSubjectIdOrderByCreatedAtDesc(String userId, String subjectId);
    long countByUserId(String userId);
}
