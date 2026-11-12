package com.smartstudy.platform.repository;

import com.smartstudy.platform.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends MongoRepository<Quiz, String> {
    List<Quiz> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Quiz> findByUserIdAndSubjectIdOrderByCreatedAtDesc(String userId, String subjectId);
    long countByUserId(String userId);
}
