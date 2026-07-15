package com.college.erp.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamMarks {

    @Id
    private Long id;

    private String studentName;
    private String rollNo;
    private String department;
    private Integer marks;
    private String grade;
    private String status;
    private String subjectCode;
}
