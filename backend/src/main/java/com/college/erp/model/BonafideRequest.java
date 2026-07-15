package com.college.erp.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bonafideRequests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BonafideRequest {
    @Id
    private Long id;
    private String studentId; // Student's Roll No
    private String studentName;
    private String department;
    private String semester;
    private String requestType; // "Bonafide"
    private String reason; // Reason/Purpose
    private String attachment; // optional attachment
    private String facultyStatus; // "Pending", "Approved", "Rejected"
    private String facultyRemarks;
    private String academicAdminStatus; // "Pending", "Approved", "Rejected"
    private String academicAdminRemarks;
    private String finalStatus; // "Pending", "Faculty Approved", "Academic Admin Approved", "Completed", "Rejected"
    private String createdDate;
    private String updatedDate;
}
