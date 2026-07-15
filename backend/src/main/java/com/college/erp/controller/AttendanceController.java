package com.college.erp.controller;

import com.college.erp.model.Attendance;
import com.college.erp.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;

    @GetMapping
    public List<Attendance> getAttendanceByDate(@RequestParam(required = false) String date) {
        if (date != null && !date.isEmpty()) {
            return attendanceRepository.findByDate(date);
        }
        return attendanceRepository.findAll();
    }

    @GetMapping("/entity/{entityId}")
    public List<Attendance> getAttendanceByEntity(
            @PathVariable String entityId,
            @RequestParam String type
    ) {
        return attendanceRepository.findByEntityIdAndEntityType(entityId, type);
    }

    @PostMapping
    public List<Attendance> saveAttendance(@RequestBody List<Attendance> attendanceList) {
        return attendanceRepository.saveAll(attendanceList);
    }
}
