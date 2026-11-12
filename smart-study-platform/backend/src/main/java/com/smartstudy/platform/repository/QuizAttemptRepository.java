package com.smartstudy.platform.repository;

import com.smartstudy.platform.model.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
    List<QuizAttempt> findByUserIdOrderByCompletedAtDesc(String userId);
    List<QuizAttempt> findByUserIdAndQuizIdOrderByCompletedAtDesc(String userId, String quizId);
    long countByUserId(String userId);
}
