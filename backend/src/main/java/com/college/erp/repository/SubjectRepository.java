package com.college.erp.repository;

import com.college.erp.model.Subject;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SubjectRepository extends MongoRepository<Subject, Long> {
    Optional<Subject> findByCode(String code);
}
