package com.college.erp.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "fees")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    private Long id;

    private String invoiceNumber;
    private String studentName;
    private String rollNo;
    private String department;
    private Double amount;
    private String dueDate;
    private String status;
}
