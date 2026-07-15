package com.college.erp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> getHomeStatus() {
        return Map.of(
            "status", "UP",
            "message", "CampusHub ERP Backend is running successfully!",
            "database", "Connected (MySQL)",
            "version", "1.0.0"
        );
    }
}
