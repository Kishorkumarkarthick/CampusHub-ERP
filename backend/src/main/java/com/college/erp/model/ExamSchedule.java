package com.college.erp.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "examSchedules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamSchedule {

    @Id
    private Long id;

    private String code;
    private String name;
    private String date;
    private String time;
    private String room;
    private Integer maxMarks;
}
