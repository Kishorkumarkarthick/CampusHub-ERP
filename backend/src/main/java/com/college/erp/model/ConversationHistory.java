package com.college.erp.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "chatHistory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationHistory {

    @Id
    private Long id;

    private String userEmail;
    private String role; // "student", "faculty", "admin"
    private String message;
    private boolean isBot;
    private LocalDateTime timestamp;
}
