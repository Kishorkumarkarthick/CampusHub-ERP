package com.college.erp.controller;

import com.college.erp.model.ConversationHistory;
import com.college.erp.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/history")
    public List<ConversationHistory> getHistory(@RequestParam String userEmail) {
        return chatService.getHistory(userEmail);
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearHistory(@RequestParam String userEmail) {
        chatService.clearHistory(userEmail);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<ConversationHistory> sendMessage(@RequestBody Map<String, String> payload) {
        String userEmail = payload.get("userEmail");
        String role = payload.get("role");
        String message = payload.get("message");

        if (userEmail == null || role == null || message == null) {
            return ResponseEntity.badRequest().build();
        }

        ConversationHistory botResponse = chatService.processMessage(userEmail, role, message);
        return ResponseEntity.ok(botResponse);
    }
}
