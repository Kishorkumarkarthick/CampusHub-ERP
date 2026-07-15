package com.college.erp.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    private Long id;

    private String txnNumber;
    private String invoiceNumber;
    private String studentName;
    private String date;
    private Double amount;
    private String method;
    private String status;
}
