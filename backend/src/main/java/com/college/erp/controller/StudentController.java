package com.college.erp.controller;

import com.college.erp.exception.ResourceNotFoundException;
import com.college.erp.model.Student;
import com.college.erp.repository.StudentRepository;
import com.college.erp.model.User;
import com.college.erp.model.Role;
import com.college.erp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin
public class StudentController {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return ResponseEntity.ok(student);
    }

    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        if (userRepository.findByEmail(student.getEmail()).isEmpty()) {
            userRepository.save(User.builder()
                    .email(student.getEmail())
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.STUDENT)
                    .build());
        }
        return studentRepository.save(student);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        if (studentDetails.getName() != null) student.setName(studentDetails.getName());
        if (studentDetails.getRollNo() != null) student.setRollNo(studentDetails.getRollNo());
        if (studentDetails.getEmail() != null) student.setEmail(studentDetails.getEmail());
        if (studentDetails.getPhone() != null) student.setPhone(studentDetails.getPhone());
        if (studentDetails.getDepartment() != null) student.setDepartment(studentDetails.getDepartment());
        if (studentDetails.getSemester() != null) student.setSemester(studentDetails.getSemester());
        if (studentDetails.getCgpa() != null) student.setCgpa(studentDetails.getCgpa());
        if (studentDetails.getAdmissionYear() != null) student.setAdmissionYear(studentDetails.getAdmissionYear());
        if (studentDetails.getAvatar() != null) student.setAvatar(studentDetails.getAvatar());
        if (studentDetails.getStudentYear() != null) student.setStudentYear(studentDetails.getStudentYear());
        if (studentDetails.getSection() != null) student.setSection(studentDetails.getSection());
        if (studentDetails.getAddress() != null) student.setAddress(studentDetails.getAddress());
        if (studentDetails.getBloodGroup() != null) student.setBloodGroup(studentDetails.getBloodGroup());
        if (studentDetails.getParentName() != null) student.setParentName(studentDetails.getParentName());
        if (studentDetails.getParentPhone() != null) student.setParentPhone(studentDetails.getParentPhone());
        if (studentDetails.getMentor() != null) student.setMentor(studentDetails.getMentor());
        if (studentDetails.getBatch() != null) student.setBatch(studentDetails.getBatch());

        return ResponseEntity.ok(studentRepository.save(student));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        studentRepository.delete(student);
        return ResponseEntity.noContent().build();
    }
}
