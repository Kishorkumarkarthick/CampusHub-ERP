package com.college.erp.service;

import com.college.erp.model.ConversationHistory;
import com.college.erp.repository.ConversationHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationHistoryRepository conversationHistoryRepository;
    private final AIService aiService;

    public List<ConversationHistory> getHistory(String userEmail) {
        return conversationHistoryRepository.findByUserEmailOrderByTimestampAsc(userEmail);
    }

    @Transactional
    public void clearHistory(String userEmail) {
        conversationHistoryRepository.deleteByUserEmail(userEmail);
    }

    @Transactional
    public ConversationHistory processMessage(String userEmail, String role, String userMessage) {
        // 1. Save user message
        ConversationHistory userRecord = ConversationHistory.builder()
                .userEmail(userEmail)
                .role(role)
                .message(userMessage)
                .isBot(false)
                .timestamp(LocalDateTime.now())
                .build();
        conversationHistoryRepository.save(userRecord);

        // 2. Generate AI reply
        String botReply = aiService.generateReply(role, userMessage);

        // 3. Save bot response
        ConversationHistory botRecord = ConversationHistory.builder()
                .userEmail(userEmail)
                .role(role)
                .message(botReply)
                .isBot(true)
                .timestamp(LocalDateTime.now())
                .build();
        conversationHistoryRepository.save(botRecord);

        return botRecord;
    }
}
