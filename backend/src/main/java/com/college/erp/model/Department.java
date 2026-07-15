package com.college.erp.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    private Long id;

    private String code;
    private String name;
    private String hod;
    private String block;
    private int facultiesCount;
    private int studentsCount;
}
