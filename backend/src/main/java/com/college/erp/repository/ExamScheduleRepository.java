package com.college.erp.repository;

import com.college.erp.model.ExamSchedule;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ExamScheduleRepository extends MongoRepository<ExamSchedule, Long> {
    Optional<ExamSchedule> findByCode(String code);
}
