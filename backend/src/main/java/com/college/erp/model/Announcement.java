package com.college.erp.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement {

    @Id
    private Long id;

    private String title;
    private String category; // "Exams", "Events", "General"
    private String date;
    private String sender;
    private String content;
    private String priority; // "High", "Medium", "Low"
}
