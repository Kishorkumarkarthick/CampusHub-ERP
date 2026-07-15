package com.college.erp.service;

import com.college.erp.exception.ResourceNotFoundException;
import com.college.erp.model.Faculty;
import com.college.erp.model.User;
import com.college.erp.model.Role;
import com.college.erp.repository.FacultyRepository;
import com.college.erp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Faculty> getAllFaculty() {
        return facultyRepository.findAll();
    }

    public Faculty getFacultyById(Long id) {
        return facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));
    }

    public Faculty createFaculty(Faculty faculty) {
        if (userRepository.findByEmail(faculty.getEmail()).isEmpty()) {
            userRepository.save(User.builder()
                    .email(faculty.getEmail())
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.FACULTY)
                    .build());
        }
        return facultyRepository.save(faculty);
    }

    public Faculty updateFaculty(Long id, Faculty facultyDetails) {
        Faculty faculty = getFacultyById(id);

        faculty.setName(facultyDetails.getName());
        faculty.setEmployeeId(facultyDetails.getEmployeeId());
        faculty.setEmail(facultyDetails.getEmail());
        faculty.setPhone(facultyDetails.getPhone());
        faculty.setDepartment(facultyDetails.getDepartment());
        faculty.setDesignation(facultyDetails.getDesignation());
        faculty.setStatus(facultyDetails.getStatus());
        faculty.setJoiningYear(facultyDetails.getJoiningYear());
        faculty.setAvatar(facultyDetails.getAvatar());
        faculty.setQualification(facultyDetails.getQualification());
        faculty.setExperience(facultyDetails.getExperience());
        faculty.setSubjectsAssigned(facultyDetails.getSubjectsAssigned());
        faculty.setOfficeRoom(facultyDetails.getOfficeRoom());
        faculty.setOfficeHours(facultyDetails.getOfficeHours());
        faculty.setAddress(facultyDetails.getAddress());
        faculty.setBloodGroup(facultyDetails.getBloodGroup());
        faculty.setJoiningDate(facultyDetails.getJoiningDate());

        return facultyRepository.save(faculty);
    }

    public void deleteFaculty(Long id) {
        Faculty faculty = getFacultyById(id);
        facultyRepository.delete(faculty);
    }
}
