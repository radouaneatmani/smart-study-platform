package com.smartstudy.platform.repository;

import com.smartstudy.platform.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByUserIdAndDocumentIdOrderByTimestampAsc(String userId, String documentId);
    List<ChatMessage> findByUserIdAndSubjectIdOrderByTimestampAsc(String userId, String subjectId);
    List<ChatMessage> findByUserIdOrderByTimestampAsc(String userId);
    long countByUserIdAndRole(String userId, String role);
}
