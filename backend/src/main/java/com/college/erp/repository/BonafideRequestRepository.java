package com.college.erp.repository;

import com.college.erp.model.BonafideRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BonafideRequestRepository extends MongoRepository<BonafideRequest, Long> {
}
