package com.college.erp.repository;

import com.college.erp.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AttendanceRepository extends MongoRepository<Attendance, Long> {
    List<Attendance> findByDate(String date);
    List<Attendance> findByEntityIdAndEntityType(String entityId, String entityType);
}
