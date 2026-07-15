package com.college.erp.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "timetable")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Timetable {

    @Id
    private Long id;

    private String dayOfWeek;
    private String timeSlot;
    private String subjectCode;
    private String subjectName;
    private String room;
    private String instructor;
    private String department;
    private String semester;
}
