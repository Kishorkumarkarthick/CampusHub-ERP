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

        if (facultyDetails.getName() != null) faculty.setName(facultyDetails.getName());
        if (facultyDetails.getEmployeeId() != null) faculty.setEmployeeId(facultyDetails.getEmployeeId());
        if (facultyDetails.getEmail() != null) faculty.setEmail(facultyDetails.getEmail());
        if (facultyDetails.getPhone() != null) faculty.setPhone(facultyDetails.getPhone());
        if (facultyDetails.getDepartment() != null) faculty.setDepartment(facultyDetails.getDepartment());
        if (facultyDetails.getDesignation() != null) faculty.setDesignation(facultyDetails.getDesignation());
        if (facultyDetails.getStatus() != null) faculty.setStatus(facultyDetails.getStatus());
        if (facultyDetails.getJoiningYear() != null) faculty.setJoiningYear(facultyDetails.getJoiningYear());
        if (facultyDetails.getAvatar() != null) faculty.setAvatar(facultyDetails.getAvatar());
        if (facultyDetails.getQualification() != null) faculty.setQualification(facultyDetails.getQualification());
        if (facultyDetails.getExperience() != null) faculty.setExperience(facultyDetails.getExperience());
        if (facultyDetails.getSubjectsAssigned() != null) faculty.setSubjectsAssigned(facultyDetails.getSubjectsAssigned());
        if (facultyDetails.getOfficeRoom() != null) faculty.setOfficeRoom(facultyDetails.getOfficeRoom());
        if (facultyDetails.getOfficeHours() != null) faculty.setOfficeHours(facultyDetails.getOfficeHours());
        if (facultyDetails.getAddress() != null) faculty.setAddress(facultyDetails.getAddress());
        if (facultyDetails.getBloodGroup() != null) faculty.setBloodGroup(facultyDetails.getBloodGroup());
        if (facultyDetails.getJoiningDate() != null) faculty.setJoiningDate(facultyDetails.getJoiningDate());

        return facultyRepository.save(faculty);
    }

    public void deleteFaculty(Long id) {
        Faculty faculty = getFacultyById(id);
        facultyRepository.delete(faculty);
    }
}
