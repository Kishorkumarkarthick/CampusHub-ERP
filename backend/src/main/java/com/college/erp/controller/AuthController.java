package com.college.erp.controller;

import com.college.erp.config.JwtUtil;
import com.college.erp.dto.AuthRequest;
import com.college.erp.dto.AuthResponse;
import com.college.erp.dto.RefreshTokenRequest;
import com.college.erp.dto.UserProfileResponse;
import com.college.erp.model.Faculty;
import com.college.erp.model.Role;
import com.college.erp.model.Student;
import com.college.erp.model.User;
import com.college.erp.repository.FacultyRepository;
import com.college.erp.repository.StudentRepository;
import com.college.erp.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAuthorized = false;
        if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            isAuthorized = true;
        } else if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findByEmail(user.getEmail()).orElse(null);
            if (student != null && student.getRollNo().equalsIgnoreCase(request.getPassword())) {
                isAuthorized = true;
            }
        } else if (user.getRole() == Role.FACULTY) {
            Faculty faculty = facultyRepository.findByEmail(user.getEmail()).orElse(null);
            if (faculty != null && faculty.getEmployeeId().equalsIgnoreCase(request.getPassword())) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        Role roleEnum = Role.STUDENT;
        if (request.getRole() != null) {
            try {
                roleEnum = Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role specified. Must be student, faculty, or admin.");
            }
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(roleEnum)
                .build();
        userRepository.save(user);

        // Auto-initialize profile
        String name = request.getEmail().split("@")[0];
        if (name.length() > 0) {
            name = name.substring(0, 1).toUpperCase() + name.substring(1);
        }

        if (roleEnum == Role.STUDENT) {
            String rollNo = "2026CS" + (1000 + (int)(Math.random() * 9000));
            Student student = Student.builder()
                    .name(name)
                    .email(request.getEmail())
                    .rollNo(rollNo)
                    .department("Computer Science & Engineering")
                    .semester("1st Semester")
                    .cgpa(0.0)
                    .admissionYear(2026)
                    .avatar("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150")
                    .build();
            studentRepository.save(student);
        } else if (roleEnum == Role.FACULTY) {
            String empId = "EMP-CS-" + (100 + (int)(Math.random() * 900));
            Faculty faculty = Faculty.builder()
                    .name(name)
                    .email(request.getEmail())
                    .employeeId(empId)
                    .department("Computer Science & Engineering")
                    .designation("Assistant Professor")
                    .status("Active")
                    .joiningYear(2026)
                    .avatar("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                    .build();
            facultyRepository.save(faculty);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String username = jwtUtil.extractUsername(refreshToken);

        if (username != null && jwtUtil.validateRefreshToken(refreshToken, username)) {
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String newAccessToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail());

            return ResponseEntity.ok(AuthResponse.builder()
                    .token(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build());
        }

        throw new RuntimeException("Invalid refresh token");
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Not authenticated");
        }

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileResponse.UserProfileResponseBuilder profileBuilder = UserProfileResponse.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .role(user.getRole().name().toLowerCase());

        if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findByEmail(user.getEmail())
                    .orElseThrow(() -> new RuntimeException("Student profile not found"));
            profileBuilder.name(student.getName())
                    .department(student.getDepartment())
                    .avatar(student.getAvatar())
                    .rollNo(student.getRollNo())
                    .semester(student.getSemester())
                    .phone(student.getPhone())
                    .studentYear(student.getStudentYear())
                    .section(student.getSection())
                    .address(student.getAddress())
                    .bloodGroup(student.getBloodGroup())
                    .parentName(student.getParentName())
                    .parentPhone(student.getParentPhone());
        } else if (user.getRole() == Role.FACULTY) {
            Faculty faculty = facultyRepository.findByEmail(user.getEmail())
                    .orElseThrow(() -> new RuntimeException("Faculty profile not found"));
            profileBuilder.name(faculty.getName())
                    .department(faculty.getDepartment())
                    .avatar(faculty.getAvatar())
                    .title(faculty.getDesignation())
                    .employeeId(faculty.getEmployeeId())
                    .phone(faculty.getPhone())
                    .qualification(faculty.getQualification())
                    .experience(faculty.getExperience())
                    .subjectsAssigned(faculty.getSubjectsAssigned())
                    .officeRoom(faculty.getOfficeRoom())
                    .officeHours(faculty.getOfficeHours())
                    .address(faculty.getAddress())
                    .bloodGroup(faculty.getBloodGroup())
                    .joiningDate(faculty.getJoiningDate())
                    .status(faculty.getStatus());
        } else if (user.getRole() == Role.ADMIN) {
            String email = user.getEmail().toLowerCase();
            String subRole = "super";
            String title = "Academic Director";
            String name = "Dr. Aravind Swamy";

            if (email.contains("academic")) {
                subRole = "academic";
                title = "Academic Administrator";
                name = "Anantha Krishnan";
            } else if (email.contains("finance")) {
                subRole = "finance";
                title = "Finance Administrator";
                name = "Ranganathan Iyer";
            } else if (email.contains("library")) {
                subRole = "library";
                title = "Library Administrator";
                name = "Madhavan Pillai";
            } else if (email.contains("placement")) {
                subRole = "placement";
                title = "Placement Officer";
                name = "Palanisamy Gounder";
            } else if (email.contains("superadmin")) {
                subRole = "super";
                title = "Super Administrator";
                name = "Senthil Kumar";
            }

            profileBuilder.name(name)
                    .department("Administration")
                    .title(title)
                    .subRole(subRole)
                    .avatar("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150");
        }

        return ResponseEntity.ok(profileBuilder.build());
    }
}
