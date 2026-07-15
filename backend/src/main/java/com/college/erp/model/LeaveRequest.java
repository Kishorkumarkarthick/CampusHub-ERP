package com.college.erp.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "leaveRequests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequest {
    @Id
    private Long id;

    // Existing fields (for backwards compatibility)
    private String requesterEmail;
    private String requesterRole; // "student", "faculty"
    private String startDate;
    private String endDate;
    private String reason; // reason / purpose
    private String status; // matches finalStatus

    // Required fields
    private String studentId; // Student's Roll No
    private String studentName;
    private String department;
    private String semester;
    private String requestType; // "Leave"
    private String attachment; // optional attachment
    private String facultyStatus; // "Pending", "Approved", "Rejected"
    private String facultyRemarks;
    private String academicAdminStatus; // "Pending", "Approved", "Rejected"
    private String academicAdminRemarks;
    private String finalStatus; // "Pending", "Faculty Approved", "Academic Admin Approved", "Completed", "Rejected"
    private String createdDate;
    private String updatedDate;
}
