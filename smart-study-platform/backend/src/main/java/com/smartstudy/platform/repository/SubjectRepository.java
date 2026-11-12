package com.smartstudy.platform.repository;

import com.smartstudy.platform.model.Subject;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends MongoRepository<Subject, String> {
    List<Subject> findByUserIdOrderByNameAsc(String userId);
    Optional<Subject> findByUserIdAndName(String userId, String name);
    long countByUserId(String userId);
}
