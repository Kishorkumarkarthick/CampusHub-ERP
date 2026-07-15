package com.college.erp.repository;

import com.college.erp.model.MarksheetRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarksheetRequestRepository extends MongoRepository<MarksheetRequest, Long> {
}
