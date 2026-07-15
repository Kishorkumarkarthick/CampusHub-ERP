package com.college.erp.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "attendance")
public class Attendance {

    @Id
    private Long id;

    private String entityId;
    private String entityType;
    private String date;
    private String status;

    // Constructors
    public Attendance() {}

    public Attendance(Long id, String entityId, String entityType, String date, String status) {
        this.id = id;
        this.entityId = entityId;
        this.entityType = entityType;
        this.date = date;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // Builder Pattern
    public static AttendanceBuilder builder() {
        return new AttendanceBuilder();
    }

    public static class AttendanceBuilder {
        private Long id;
        private String entityId;
        private String entityType;
        private String date;
        private String status;

        public AttendanceBuilder id(Long id) { this.id = id; return this; }
        public AttendanceBuilder entityId(String entityId) { this.entityId = entityId; return this; }
        public AttendanceBuilder entityType(String entityType) { this.entityType = entityType; return this; }
        public AttendanceBuilder date(String date) { this.date = date; return this; }
        public AttendanceBuilder status(String status) { this.status = status; return this; }

        public Attendance build() {
            return new Attendance(id, entityId, entityType, date, status);
        }
    }
}
