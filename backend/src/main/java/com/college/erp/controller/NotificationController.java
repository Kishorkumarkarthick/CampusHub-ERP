package com.college.erp.controller;

import com.college.erp.exception.ResourceNotFoundException;
import com.college.erp.model.Notification;
import com.college.erp.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getNotifications(
            @RequestParam String userEmail,
            @RequestParam(required = false) Boolean unreadOnly
    ) {
        if (unreadOnly != null && unreadOnly) {
            return notificationRepository.findByUserEmailAndIsReadOrderByDateDesc(userEmail, false);
        }
        return notificationRepository.findByUserEmailOrderByDateDesc(userEmail);
    }

    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        notification.setRead(false);
        if (notification.getDate() == null || notification.getDate().isEmpty()) {
            notification.setDate(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm").format(new java.util.Date()));
        }
        return notificationRepository.save(notification);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        notification.setRead(true);
        return ResponseEntity.ok(notificationRepository.save(notification));
    }
}
