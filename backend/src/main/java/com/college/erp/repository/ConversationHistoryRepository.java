package com.college.erp.repository;

import com.college.erp.model.ConversationHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConversationHistoryRepository extends MongoRepository<ConversationHistory, Long> {
    List<ConversationHistory> findByUserEmailOrderByTimestampAsc(String userEmail);
    void deleteByUserEmail(String userEmail);
}
