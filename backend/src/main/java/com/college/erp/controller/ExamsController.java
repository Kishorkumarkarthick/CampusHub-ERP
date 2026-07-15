package com.college.erp.controller;

import com.college.erp.model.ExamMarks;
import com.college.erp.model.ExamSchedule;
import com.college.erp.repository.ExamMarksRepository;
import com.college.erp.repository.ExamScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@CrossOrigin
public class ExamsController {

    private final ExamScheduleRepository examScheduleRepository;
    private final ExamMarksRepository examMarksRepository;

    @GetMapping("/schedules")
    public List<ExamSchedule> getAllSchedules() {
        return examScheduleRepository.findAll();
    }

    @PostMapping("/schedules")
    public ExamSchedule createSchedule(@RequestBody ExamSchedule schedule) {
        return examScheduleRepository.save(schedule);
    }

    @GetMapping("/marks")
    public List<ExamMarks> getMarksBySubject(@RequestParam(required = false) String subjectCode) {
        if (subjectCode != null && !subjectCode.isEmpty()) {
            return examMarksRepository.findBySubjectCode(subjectCode);
        }
        return examMarksRepository.findAll();
    }

    @PostMapping("/marks")
    public List<ExamMarks> saveMarks(@RequestBody List<ExamMarks> marksList) {
        return examMarksRepository.saveAll(marksList);
    }
}
