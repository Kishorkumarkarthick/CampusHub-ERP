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

        student.setName(studentDetails.getName());
        student.setRollNo(studentDetails.getRollNo());
        student.setEmail(studentDetails.getEmail());
        student.setPhone(studentDetails.getPhone());
        student.setDepartment(studentDetails.getDepartment());
        student.setSemester(studentDetails.getSemester());
        student.setCgpa(studentDetails.getCgpa());
        student.setAdmissionYear(studentDetails.getAdmissionYear());
        student.setAvatar(studentDetails.getAvatar());
        student.setStudentYear(studentDetails.getStudentYear());
        student.setSection(studentDetails.getSection());
        student.setAddress(studentDetails.getAddress());
        student.setBloodGroup(studentDetails.getBloodGroup());
        student.setParentName(studentDetails.getParentName());
        student.setParentPhone(studentDetails.getParentPhone());

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
