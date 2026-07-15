package com.college.erp.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    private Long id;

    private String isbn;
    private String title;
    private String author;
    private String category;
    private String status; // "Available" or "Borrowed"
    private String borrowedBy;
    private String dueDate;
}
