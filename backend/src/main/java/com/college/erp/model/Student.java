package com.college.erp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "students")
public class Student {

    @Id
    private Long id;

    private String name;
    private String rollNo;
    private String email;
    private String phone;
    private String department;
    private String semester;
    private Double cgpa;
    private Integer admissionYear;
    private String avatar;

    // Additional profile fields
    private String studentYear;
    private String section;
    private String address;
    private String bloodGroup;
    private String parentName;
    private String parentPhone;

    // Constructors
    public Student() {}

    public Student(Long id, String name, String rollNo, String email, String phone, String department, String semester, Double cgpa, Integer admissionYear, String avatar, String studentYear, String section, String address, String bloodGroup, String parentName, String parentPhone) {
        this.id = id;
        this.name = name;
        this.rollNo = rollNo;
        this.email = email;
        this.phone = phone;
        this.department = department;
        this.semester = semester;
        this.cgpa = cgpa;
        this.admissionYear = admissionYear;
        this.avatar = avatar;
        this.studentYear = studentYear;
        this.section = section;
        this.address = address;
        this.bloodGroup = bloodGroup;
        this.parentName = parentName;
        this.parentPhone = parentPhone;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public Integer getAdmissionYear() { return admissionYear; }
    public void setAdmissionYear(Integer admissionYear) { this.admissionYear = admissionYear; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getStudentYear() { return studentYear; }
    public void setStudentYear(String studentYear) { this.studentYear = studentYear; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public String getParentPhone() { return parentPhone; }
    public void setParentPhone(String parentPhone) { this.parentPhone = parentPhone; }

    // Builder Pattern
    public static StudentBuilder builder() {
        return new StudentBuilder();
    }

    public static class StudentBuilder {
        private Long id;
        private String name;
        private String rollNo;
        private String email;
        private String phone;
        private String department;
        private String semester;
        private Double cgpa;
        private Integer admissionYear;
        private String avatar;
        private String studentYear;
        private String section;
        private String address;
        private String bloodGroup;
        private String parentName;
        private String parentPhone;

        public StudentBuilder id(Long id) { this.id = id; return this; }
        public StudentBuilder name(String name) { this.name = name; return this; }
        public StudentBuilder rollNo(String rollNo) { this.rollNo = rollNo; return this; }
        public StudentBuilder email(String email) { this.email = email; return this; }
        public StudentBuilder phone(String phone) { this.phone = phone; return this; }
        public StudentBuilder department(String department) { this.department = department; return this; }
        public StudentBuilder semester(String semester) { this.semester = semester; return this; }
        public StudentBuilder cgpa(Double cgpa) { this.cgpa = cgpa; return this; }
        public StudentBuilder admissionYear(Integer admissionYear) { this.admissionYear = admissionYear; return this; }
        public StudentBuilder avatar(String avatar) { this.avatar = avatar; return this; }
        public StudentBuilder studentYear(String studentYear) { this.studentYear = studentYear; return this; }
        public StudentBuilder section(String section) { this.section = section; return this; }
        public StudentBuilder address(String address) { this.address = address; return this; }
        public StudentBuilder bloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; return this; }
        public StudentBuilder parentName(String parentName) { this.parentName = parentName; return this; }
        public StudentBuilder parentPhone(String parentPhone) { this.parentPhone = parentPhone; return this; }

        public Student build() {
            return new Student(id, name, rollNo, email, phone, department, semester, cgpa, admissionYear, avatar, studentYear, section, address, bloodGroup, parentName, parentPhone);
        }
    }
}
