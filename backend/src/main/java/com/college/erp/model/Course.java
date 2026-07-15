package com.college.erp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "courses")
public class Course {

    @Id
    private Long id;

    private String code;
    private String name;
    private String department;
    private Integer credits;
    private String duration;
    private String faculty;
    private Integer studentCount;
    private String status;
    private List<String> syllabus;

    // Constructors
    public Course() {}

    public Course(Long id, String code, String name, String department, Integer credits, String duration, String faculty, Integer studentCount, String status, List<String> syllabus) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.department = department;
        this.credits = credits;
        this.duration = duration;
        this.faculty = faculty;
        this.studentCount = studentCount;
        this.status = status;
        this.syllabus = syllabus;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }

    public Integer getStudentCount() { return studentCount; }
    public void setStudentCount(Integer studentCount) { this.studentCount = studentCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getSyllabus() { return syllabus; }
    public void setSyllabus(List<String> syllabus) { this.syllabus = syllabus; }

    // Builder Pattern
    public static CourseBuilder builder() {
        return new CourseBuilder();
    }

    public static class CourseBuilder {
        private Long id;
        private String code;
        private String name;
        private String department;
        private Integer credits;
        private String duration;
        private String faculty;
        private Integer studentCount;
        private String status;
        private List<String> syllabus;

        public CourseBuilder id(Long id) { this.id = id; return this; }
        public CourseBuilder code(String code) { this.code = code; return this; }
        public CourseBuilder name(String name) { this.name = name; return this; }
        public CourseBuilder department(String department) { this.department = department; return this; }
        public CourseBuilder credits(Integer credits) { this.credits = credits; return this; }
        public CourseBuilder duration(String duration) { this.duration = duration; return this; }
        public CourseBuilder faculty(String faculty) { this.faculty = faculty; return this; }
        public CourseBuilder studentCount(Integer studentCount) { this.studentCount = studentCount; return this; }
        public CourseBuilder status(String status) { this.status = status; return this; }
        public CourseBuilder syllabus(List<String> syllabus) { this.syllabus = syllabus; return this; }

        public Course build() {
            return new Course(id, code, name, department, credits, duration, faculty, studentCount, status, syllabus);
        }
    }
}
