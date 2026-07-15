package com.college.erp.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "library")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Library {
    @Id
    private Long id;
    private String studentRollNo;
    private String membershipStatus; // "Active", "Suspended"
    private Integer booksBorrowedCount;
    private Double fineAmount;
}
