package com.college.erp.config;

import com.college.erp.model.*;
import com.college.erp.service.SequenceGeneratorService;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertCallback;
import org.springframework.stereotype.Component;

@Component
public class MongoModelListener implements BeforeConvertCallback<Object> {

    private final SequenceGeneratorService sequenceGenerator;

    public MongoModelListener(@Lazy SequenceGeneratorService sequenceGenerator) {
        this.sequenceGenerator = sequenceGenerator;
    }

    @Override
    public Object onBeforeConvert(Object entity, String collection) {
        if (entity instanceof User u && u.getId() == null) {
            u.setId(sequenceGenerator.generateSequence("users_sequence"));
        } else if (entity instanceof Student s && s.getId() == null) {
            s.setId(sequenceGenerator.generateSequence("students_sequence"));
        } else if (entity instanceof Faculty f && f.getId() == null) {
            f.setId(sequenceGenerator.generateSequence("faculty_sequence"));
        } else if (entity instanceof Course c && c.getId() == null) {
            c.setId(sequenceGenerator.generateSequence("courses_sequence"));
        } else if (entity instanceof Department d && d.getId() == null) {
            d.setId(sequenceGenerator.generateSequence("departments_sequence"));
        } else if (entity instanceof Subject sub && sub.getId() == null) {
            sub.setId(sequenceGenerator.generateSequence("subjects_sequence"));
        } else if (entity instanceof Timetable t && t.getId() == null) {
            t.setId(sequenceGenerator.generateSequence("timetable_sequence"));
        } else if (entity instanceof Attendance a && a.getId() == null) {
            a.setId(sequenceGenerator.generateSequence("attendance_sequence"));
        } else if (entity instanceof Invoice inv && inv.getId() == null) {
            inv.setId(sequenceGenerator.generateSequence("fees_sequence"));
        } else if (entity instanceof Transaction txn && txn.getId() == null) {
            txn.setId(sequenceGenerator.generateSequence("payments_sequence"));
        } else if (entity instanceof Book b && b.getId() == null) {
            b.setId(sequenceGenerator.generateSequence("books_sequence"));
        } else if (entity instanceof Announcement ann && ann.getId() == null) {
            ann.setId(sequenceGenerator.generateSequence("announcements_sequence"));
        } else if (entity instanceof Notification n && n.getId() == null) {
            n.setId(sequenceGenerator.generateSequence("notifications_sequence"));
        } else if (entity instanceof ConversationHistory ch && ch.getId() == null) {
            ch.setId(sequenceGenerator.generateSequence("chatHistory_sequence"));
        } else if (entity instanceof ExamMarks em && em.getId() == null) {
            em.setId(sequenceGenerator.generateSequence("results_sequence"));
        } else if (entity instanceof ExamSchedule es && es.getId() == null) {
            es.setId(sequenceGenerator.generateSequence("examSchedules_sequence"));
        } else if (entity instanceof LeaveRequest lr && lr.getId() == null) {
            lr.setId(sequenceGenerator.generateSequence("leaveRequests_sequence"));
        } else if (entity instanceof BonafideRequest br && br.getId() == null) {
            br.setId(sequenceGenerator.generateSequence("bonafideRequests_sequence"));
        } else if (entity instanceof MarksheetRequest mr && mr.getId() == null) {
            mr.setId(sequenceGenerator.generateSequence("marksheetRequests_sequence"));
        } else if (entity instanceof ActivityLog al && al.getId() == null) {
            al.setId(sequenceGenerator.generateSequence("activityLogs_sequence"));
        } else if (entity instanceof SystemSetting ss && ss.getId() == null) {
            ss.setId(sequenceGenerator.generateSequence("systemSettings_sequence"));
        } else if (entity instanceof Library lib && lib.getId() == null) {
            lib.setId(sequenceGenerator.generateSequence("library_sequence"));
        }
        return entity;
    }
}
