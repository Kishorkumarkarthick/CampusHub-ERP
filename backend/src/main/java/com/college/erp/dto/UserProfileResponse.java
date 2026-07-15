package com.college.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String name;
    private String email;
    private String role; // student, faculty, admin
    private String department;
    private String avatar;
    private String rollNo;
    private String semester;
    private String title;
    private String subRole;

    // Student fields
    private String phone;
    private String studentYear;
    private String section;
    private String address;
    private String bloodGroup;
    private String parentName;
    private String parentPhone;

    // Faculty fields
    private String employeeId;
    private String qualification;
    private String experience;
    private String subjectsAssigned;
    private String officeRoom;
    private String officeHours;
    private String joiningDate;
    private String status;
}
