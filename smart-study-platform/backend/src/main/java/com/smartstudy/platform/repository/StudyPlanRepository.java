package com.smartstudy.platform.repository;

import com.smartstudy.platform.model.StudyPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyPlanRepository extends MongoRepository<StudyPlan, String> {
    List<StudyPlan> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<StudyPlan> findByUserIdAndSubjectId(String userId, String subjectId);
}
