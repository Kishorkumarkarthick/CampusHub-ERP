package com.college.erp.repository;

import com.college.erp.model.Timetable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableRepository extends MongoRepository<Timetable, Long> {
    List<Timetable> findByDepartment(String department);
    List<Timetable> findByInstructor(String instructor);
}
