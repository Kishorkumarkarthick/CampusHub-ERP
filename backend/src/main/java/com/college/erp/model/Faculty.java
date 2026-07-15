package com.college.erp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "faculty")
public class Faculty {

    @Id
    private Long id;

    private String name;
    private String employeeId;
    private String email;
    private String phone;
    private String department;
    private String designation;
    private String status;
    private Integer joiningYear;
    private String avatar;

    // Additional profile fields
    private String qualification;
    private String experience;
    private String subjectsAssigned;
    private String officeRoom;
    private String officeHours;
    private String address;
    private String bloodGroup;
    private String joiningDate;

    // Constructors
    public Faculty() {}

    public Faculty(Long id, String name, String employeeId, String email, String phone, String department, String designation, String status, Integer joiningYear, String avatar, String qualification, String experience, String subjectsAssigned, String officeRoom, String officeHours, String address, String bloodGroup, String joiningDate) {
        this.id = id;
        this.name = name;
        this.employeeId = employeeId;
        this.email = email;
        this.phone = phone;
        this.department = department;
        this.designation = designation;
        this.status = status;
        this.joiningYear = joiningYear;
        this.avatar = avatar;
        this.qualification = qualification;
        this.experience = experience;
        this.subjectsAssigned = subjectsAssigned;
        this.officeRoom = officeRoom;
        this.officeHours = officeHours;
        this.address = address;
        this.bloodGroup = bloodGroup;
        this.joiningDate = joiningDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getJoiningYear() { return joiningYear; }
    public void setJoiningYear(Integer joiningYear) { this.joiningYear = joiningYear; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getSubjectsAssigned() { return subjectsAssigned; }
    public void setSubjectsAssigned(String subjectsAssigned) { this.subjectsAssigned = subjectsAssigned; }

    public String getOfficeRoom() { return officeRoom; }
    public void setOfficeRoom(String officeRoom) { this.officeRoom = officeRoom; }

    public String getOfficeHours() { return officeHours; }
    public void setOfficeHours(String officeHours) { this.officeHours = officeHours; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getJoiningDate() { return joiningDate; }
    public void setJoiningDate(String joiningDate) { this.joiningDate = joiningDate; }

    // Builder Pattern
    public static FacultyBuilder builder() {
        return new FacultyBuilder();
    }

    public static class FacultyBuilder {
        private Long id;
        private String name;
        private String employeeId;
        private String email;
        private String phone;
        private String department;
        private String designation;
        private String status;
        private Integer joiningYear;
        private String avatar;
        private String qualification;
        private String experience;
        private String subjectsAssigned;
        private String officeRoom;
        private String officeHours;
        private String address;
        private String bloodGroup;
        private String joiningDate;

        public FacultyBuilder id(Long id) { this.id = id; return this; }
        public FacultyBuilder name(String name) { this.name = name; return this; }
        public FacultyBuilder employeeId(String employeeId) { this.employeeId = employeeId; return this; }
        public FacultyBuilder email(String email) { this.email = email; return this; }
        public FacultyBuilder phone(String phone) { this.phone = phone; return this; }
        public FacultyBuilder department(String department) { this.department = department; return this; }
        public FacultyBuilder designation(String designation) { this.designation = designation; return this; }
        public FacultyBuilder status(String status) { this.status = status; return this; }
        public FacultyBuilder joiningYear(Integer joiningYear) { this.joiningYear = joiningYear; return this; }
        public FacultyBuilder avatar(String avatar) { this.avatar = avatar; return this; }
        public FacultyBuilder qualification(String qualification) { this.qualification = qualification; return this; }
        public FacultyBuilder experience(String experience) { this.experience = experience; return this; }
        public FacultyBuilder subjectsAssigned(String subjectsAssigned) { this.subjectsAssigned = subjectsAssigned; return this; }
        public FacultyBuilder officeRoom(String officeRoom) { this.officeRoom = officeRoom; return this; }
        public FacultyBuilder officeHours(String officeHours) { this.officeHours = officeHours; return this; }
        public FacultyBuilder address(String address) { this.address = address; return this; }
        public FacultyBuilder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }
        public FacultyBuilder joiningDate(String joiningDate) { this.joiningDate = joiningDate; return this; }

        public Faculty build() {
            return new Faculty(id, name, employeeId, email, phone, department, designation, status, joiningYear, avatar, qualification, experience, subjectsAssigned, officeRoom, officeHours, address, bloodGroup, joiningDate);
        }
    }
}
