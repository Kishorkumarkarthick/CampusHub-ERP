package com.college.erp.repository;

import com.college.erp.model.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, Long> {
    Optional<Department> findByCode(String code);
}
