package com.college.erp.repository;

import com.college.erp.model.Announcement;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AnnouncementRepository extends MongoRepository<Announcement, Long> {
}
