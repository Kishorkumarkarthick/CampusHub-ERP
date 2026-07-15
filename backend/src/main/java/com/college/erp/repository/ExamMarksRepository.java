package com.college.erp.repository;

import com.college.erp.model.ExamMarks;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ExamMarksRepository extends MongoRepository<ExamMarks, Long> {
    List<ExamMarks> findBySubjectCode(String subjectCode);
    List<ExamMarks> findByRollNo(String rollNo);
}
