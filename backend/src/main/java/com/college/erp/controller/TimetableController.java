package com.college.erp.controller;

import com.college.erp.exception.ResourceNotFoundException;
import com.college.erp.model.Timetable;
import com.college.erp.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
@CrossOrigin
public class TimetableController {

    private final TimetableRepository timetableRepository;

    @GetMapping
    public List<Timetable> getTimetable(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String instructor
    ) {
        if (department != null && !department.isEmpty()) {
            return timetableRepository.findByDepartment(department);
        }
        if (instructor != null && !instructor.isEmpty()) {
            return timetableRepository.findByInstructor(instructor);
        }
        return timetableRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Timetable> getSlotById(@PathVariable Long id) {
        Timetable slot = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable slot not found with id: " + id));
        return ResponseEntity.ok(slot);
    }

    @PostMapping
    public Timetable createSlot(@RequestBody Timetable timetable) {
        return timetableRepository.save(timetable);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Timetable> updateSlot(@PathVariable Long id, @RequestBody Timetable details) {
        Timetable slot = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable slot not found with id: " + id));

        slot.setDayOfWeek(details.getDayOfWeek());
        slot.setTimeSlot(details.getTimeSlot());
        slot.setSubjectCode(details.getSubjectCode());
        slot.setSubjectName(details.getSubjectName());
        slot.setRoom(details.getRoom());
        slot.setInstructor(details.getInstructor());
        slot.setDepartment(details.getDepartment());
        slot.setSemester(details.getSemester());

        return ResponseEntity.ok(timetableRepository.save(slot));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        Timetable slot = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable slot not found with id: " + id));
        timetableRepository.delete(slot);
        return ResponseEntity.noContent().build();
    }
}
