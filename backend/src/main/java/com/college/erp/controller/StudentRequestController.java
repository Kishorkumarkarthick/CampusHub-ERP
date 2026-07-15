package com.college.erp.controller;

import com.college.erp.model.*;
import com.college.erp.repository.*;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentRequestController {

    private final LeaveRequestRepository leaveRequestRepository;
    private final BonafideRequestRepository bonafideRequestRepository;
    private final MarksheetRequestRepository marksheetRequestRepository;
    private final NotificationRepository notificationRepository;
    private final FacultyRepository facultyRepository;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private void sendNotification(String email, String title, String message) {
        notificationRepository.save(Notification.builder()
                .userEmail(email)
                .title(title)
                .message(message)
                .date(formatter.format(LocalDateTime.now()))
                .isRead(false)
                .build());
    }

    private void notifyFacultyOfDept(String dept, String studentName) {
        List<Faculty> faculties = facultyRepository.findAll();
        for (Faculty f : faculties) {
            if (f.getDepartment().equalsIgnoreCase(dept)) {
                sendNotification(f.getEmail(), "New Student Request Pending", 
                        "A new student request has been submitted by " + studentName + " in your department.");
            }
        }
    }

    private void notifyAdmins(String studentName, String type) {
        sendNotification("academic@campushub.edu", "Request Forwarded for Approval",
                "A student " + type + " request for " + studentName + " has been forwarded to you for final approval.");
        sendNotification("admin@college.edu", "Request Forwarded for Approval",
                "A student " + type + " request for " + studentName + " has been forwarded for final approval.");
    }

    @PostMapping("/leave")
    public ResponseEntity<?> createLeaveRequest(@RequestBody LeaveRequest req) {
        req.setRequestType("Leave");
        req.setFacultyStatus("Pending");
        req.setAcademicAdminStatus("Pending");
        req.setFinalStatus("Pending");
        req.setCreatedDate(formatter.format(LocalDateTime.now()));
        req.setUpdatedDate(formatter.format(LocalDateTime.now()));
        req.setRequesterRole("student");
        req.setStatus("Pending");
        LeaveRequest saved = leaveRequestRepository.save(req);
        notifyFacultyOfDept(req.getDepartment(), req.getStudentName());
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/bonafide")
    public ResponseEntity<?> createBonafideRequest(@RequestBody BonafideRequest req) {
        req.setRequestType("Bonafide");
        req.setFacultyStatus("Pending");
        req.setAcademicAdminStatus("Pending");
        req.setFinalStatus("Pending");
        req.setCreatedDate(formatter.format(LocalDateTime.now()));
        req.setUpdatedDate(formatter.format(LocalDateTime.now()));
        BonafideRequest saved = bonafideRequestRepository.save(req);
        notifyFacultyOfDept(req.getDepartment(), req.getStudentName());
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/marksheet")
    public ResponseEntity<?> createMarksheetRequest(@RequestBody MarksheetRequest req) {
        req.setRequestType("Marksheet");
        req.setFacultyStatus("Pending");
        req.setAcademicAdminStatus("Pending");
        req.setFinalStatus("Pending");
        req.setCreatedDate(formatter.format(LocalDateTime.now()));
        req.setUpdatedDate(formatter.format(LocalDateTime.now()));
        MarksheetRequest saved = marksheetRequestRepository.save(req);
        notifyFacultyOfDept(req.getDepartment(), req.getStudentName());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentRequests(@PathVariable String studentId) {
        List<Object> combined = new ArrayList<>();
        combined.addAll(leaveRequestRepository.findAll().stream().filter(r -> studentId.equalsIgnoreCase(r.getStudentId())).toList());
        combined.addAll(bonafideRequestRepository.findAll().stream().filter(r -> studentId.equalsIgnoreCase(r.getStudentId())).toList());
        combined.addAll(marksheetRequestRepository.findAll().stream().filter(r -> studentId.equalsIgnoreCase(r.getStudentId())).toList());
        return ResponseEntity.ok(combined);
    }

    @GetMapping("/faculty/{department}")
    public ResponseEntity<?> getFacultyRequests(@PathVariable String department) {
        List<Object> combined = new ArrayList<>();
        combined.addAll(leaveRequestRepository.findAll().stream().filter(r -> department.equalsIgnoreCase(r.getDepartment())).toList());
        combined.addAll(bonafideRequestRepository.findAll().stream().filter(r -> department.equalsIgnoreCase(r.getDepartment())).toList());
        combined.addAll(marksheetRequestRepository.findAll().stream().filter(r -> department.equalsIgnoreCase(r.getDepartment())).toList());
        return ResponseEntity.ok(combined);
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAdminRequests() {
        List<Object> combined = new ArrayList<>();
        combined.addAll(leaveRequestRepository.findAll().stream().filter(r -> "Approved".equalsIgnoreCase(r.getFacultyStatus()) || !"Pending".equalsIgnoreCase(r.getAcademicAdminStatus())).toList());
        combined.addAll(bonafideRequestRepository.findAll().stream().filter(r -> "Approved".equalsIgnoreCase(r.getFacultyStatus()) || !"Pending".equalsIgnoreCase(r.getAcademicAdminStatus())).toList());
        combined.addAll(marksheetRequestRepository.findAll().stream().filter(r -> "Approved".equalsIgnoreCase(r.getFacultyStatus()) || !"Pending".equalsIgnoreCase(r.getAcademicAdminStatus())).toList());
        return ResponseEntity.ok(combined);
    }

    @PutMapping("/{type}/{id}/faculty")
    public ResponseEntity<?> updateFacultyStatus(@PathVariable String type, @PathVariable Long id, @RequestParam String status, @RequestParam(required = false) String remarks) {
        String finalRemarks = remarks == null ? "" : remarks;
        if ("leave".equalsIgnoreCase(type)) {
            Optional<LeaveRequest> op = leaveRequestRepository.findById(id);
            if (op.isPresent()) {
                LeaveRequest req = op.get();
                req.setFacultyStatus(status);
                req.setFacultyRemarks(finalRemarks);
                req.setUpdatedDate(formatter.format(LocalDateTime.now()));
                if ("Rejected".equalsIgnoreCase(status)) {
                    req.setFinalStatus("Rejected");
                    req.setStatus("Rejected");
                    sendNotification(req.getRequesterEmail(), "Request Rejected by Faculty", "Your leave request was rejected: " + finalRemarks);
                } else {
                    req.setFinalStatus("Faculty Approved");
                    notifyAdmins(req.getStudentName(), "Leave");
                }
                leaveRequestRepository.save(req);
                return ResponseEntity.ok(req);
            }
        } else if ("bonafide".equalsIgnoreCase(type)) {
            Optional<BonafideRequest> op = bonafideRequestRepository.findById(id);
            if (op.isPresent()) {
                BonafideRequest req = op.get();
                req.setFacultyStatus(status);
                req.setFacultyRemarks(finalRemarks);
                req.setUpdatedDate(formatter.format(LocalDateTime.now()));
                if ("Rejected".equalsIgnoreCase(status)) {
                    req.setFinalStatus("Rejected");
                    sendNotification(req.getStudentId() + "@campushub.edu", "Request Rejected by Faculty", "Your bonafide request was rejected: " + finalRemarks);
                } else {
                    req.setFinalStatus("Faculty Approved");
                    notifyAdmins(req.getStudentName(), "Bonafide");
                }
                bonafideRequestRepository.save(req);
                return ResponseEntity.ok(req);
            }
        } else if ("marksheet".equalsIgnoreCase(type)) {
            Optional<MarksheetRequest> op = marksheetRequestRepository.findById(id);
            if (op.isPresent()) {
                MarksheetRequest req = op.get();
                req.setFacultyStatus(status);
                req.setFacultyRemarks(finalRemarks);
                req.setUpdatedDate(formatter.format(LocalDateTime.now()));
                if ("Rejected".equalsIgnoreCase(status)) {
                    req.setFinalStatus("Rejected");
                    sendNotification(req.getStudentId() + "@campushub.edu", "Request Rejected by Faculty", "Your marksheet request was rejected: " + finalRemarks);
                } else {
                    req.setFinalStatus("Faculty Approved");
                    notifyAdmins(req.getStudentName(), "Marksheet");
                }
                marksheetRequestRepository.save(req);
                return ResponseEntity.ok(req);
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Request not found");
    }

    @PutMapping("/{type}/{id}/admin")
    public ResponseEntity<?> updateAdminStatus(@PathVariable String type, @PathVariable Long id, @RequestParam String status, @RequestParam(required = false) String remarks) {
        String finalRemarks = remarks == null ? "" : remarks;
        if ("leave".equalsIgnoreCase(type)) {
            Optional<LeaveRequest> op = leaveRequestRepository.findById(id);
            if (op.isPresent()) {
                LeaveRequest req = op.get();
                req.setAcademicAdminStatus(status);
                req.setAcademicAdminRemarks(finalRemarks);
                req.setUpdatedDate(formatter.format(LocalDateTime.now()));
                if ("Rejected".equalsIgnoreCase(status)) {
                    req.setFinalStatus("Rejected");
                    req.setStatus("Rejected");
                    sendNotification(req.getRequesterEmail(), "Request Rejected by Academic Admin", "Your leave request was rejected: " + finalRemarks);
                } else {
                    req.setFinalStatus("Completed");
                    req.setStatus("Approved");
                    sendNotification(req.getRequesterEmail(), "Request Approved", "Your leave request has been fully approved!");
                }
                leaveRequestRepository.save(req);
                return ResponseEntity.ok(req);
            }
        } else if ("bonafide".equalsIgnoreCase(type)) {
            Optional<BonafideRequest> op = bonafideRequestRepository.findById(id);
            if (op.isPresent()) {
                BonafideRequest req = op.get();
                req.setAcademicAdminStatus(status);
                req.setAcademicAdminRemarks(finalRemarks);
                req.setUpdatedDate(formatter.format(LocalDateTime.now()));
                if ("Rejected".equalsIgnoreCase(status)) {
                    req.setFinalStatus("Rejected");
                    sendNotification(req.getStudentId() + "@campushub.edu", "Request Rejected by Academic Admin", "Your bonafide request was rejected: " + finalRemarks);
                } else if ("Approved".equalsIgnoreCase(status)) {
                    req.setFinalStatus("Academic Admin Approved");
                    sendNotification(req.getStudentId() + "@campushub.edu", "Request Approved", "Your bonafide certificate request has been approved and is being processed.");
                } else if ("Completed".equalsIgnoreCase(status) || "Ready for Download".equalsIgnoreCase(status)) {
                    req.setFinalStatus("Completed");
                    sendNotification(req.getStudentId() + "@campushub.edu", "Certificate Ready for Download", "Your bonafide certificate is ready. Download it from request history.");
                }
                bonafideRequestRepository.save(req);
                return ResponseEntity.ok(req);
            }
        } else if ("marksheet".equalsIgnoreCase(type)) {
            Optional<MarksheetRequest> op = marksheetRequestRepository.findById(id);
            if (op.isPresent()) {
                MarksheetRequest req = op.get();
                req.setAcademicAdminStatus(status);
                req.setAcademicAdminRemarks(finalRemarks);
                req.setUpdatedDate(formatter.format(LocalDateTime.now()));
                if ("Rejected".equalsIgnoreCase(status)) {
                    req.setFinalStatus("Rejected");
                    sendNotification(req.getStudentId() + "@campushub.edu", "Request Rejected by Academic Admin", "Your marksheet request was rejected: " + finalRemarks);
                } else if ("Approved".equalsIgnoreCase(status)) {
                    req.setFinalStatus("Academic Admin Approved");
                    sendNotification(req.getStudentId() + "@campushub.edu", "Request Approved", "Your marksheet request has been approved and is being processed.");
                } else if ("Completed".equalsIgnoreCase(status) || "Ready for Download".equalsIgnoreCase(status)) {
                    req.setFinalStatus("Completed");
                    sendNotification(req.getStudentId() + "@campushub.edu", "Marksheet Ready for Download", "Your marksheet is ready. Download it from request history.");
                }
                marksheetRequestRepository.save(req);
                return ResponseEntity.ok(req);
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Request not found");
    }

    @PutMapping("/{type}/{id}/edit")
    public ResponseEntity<?> editRequest(@PathVariable String type, @PathVariable Long id, @RequestParam String reason, @RequestParam(required = false) String attachment) {
        if ("leave".equalsIgnoreCase(type)) {
            Optional<LeaveRequest> op = leaveRequestRepository.findById(id);
            if (op.isPresent()) {
                LeaveRequest req = op.get();
                if (!"Pending".equalsIgnoreCase(req.getFinalStatus())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot edit approved or rejected requests");
                }
                req.setReason(reason);
                if (attachment != null) req.setAttachment(attachment);
                req.setUpdatedDate(formatter.format(LocalDateTime.now()));
                leaveRequestRepository.save(req);
                return ResponseEntity.ok(req);
            }
        } else if ("bonafide".equalsIgnoreCase(type)) {
            Optional<BonafideRequest> op = bonafideRequestRepository.findById(id);
            if (op.isPresent()) {
                BonafideRequest req = op.get();
                if (!"Pending".equalsIgnoreCase(req.getFinalStatus())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot edit approved or rejected requests");
                }
                req.setReason(reason);
                if (attachment != null) req.setAttachment(attachment);
                req.setUpdatedDate(formatter.format(LocalDateTime.now()));
                bonafideRequestRepository.save(req);
                return ResponseEntity.ok(req);
            }
        } else if ("marksheet".equalsIgnoreCase(type)) {
            Optional<MarksheetRequest> op = marksheetRequestRepository.findById(id);
            if (op.isPresent()) {
                MarksheetRequest req = op.get();
                if (!"Pending".equalsIgnoreCase(req.getFinalStatus())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot edit approved or rejected requests");
                }
                req.setReason(reason);
                if (attachment != null) req.setAttachment(attachment);
                req.setUpdatedDate(formatter.format(LocalDateTime.now()));
                marksheetRequestRepository.save(req);
                return ResponseEntity.ok(req);
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Request not found");
    }

    @DeleteMapping("/{type}/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable String type, @PathVariable Long id) {
        if ("leave".equalsIgnoreCase(type)) {
            Optional<LeaveRequest> op = leaveRequestRepository.findById(id);
            if (op.isPresent()) {
                LeaveRequest req = op.get();
                if (!"Pending".equalsIgnoreCase(req.getFinalStatus())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot cancel approved or rejected requests");
                }
                leaveRequestRepository.deleteById(id);
                return ResponseEntity.ok("Deleted successfully");
            }
        } else if ("bonafide".equalsIgnoreCase(type)) {
            Optional<BonafideRequest> op = bonafideRequestRepository.findById(id);
            if (op.isPresent()) {
                BonafideRequest req = op.get();
                if (!"Pending".equalsIgnoreCase(req.getFinalStatus())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot cancel approved or rejected requests");
                }
                bonafideRequestRepository.deleteById(id);
                return ResponseEntity.ok("Deleted successfully");
            }
        } else if ("marksheet".equalsIgnoreCase(type)) {
            Optional<MarksheetRequest> op = marksheetRequestRepository.findById(id);
            if (op.isPresent()) {
                MarksheetRequest req = op.get();
                if (!"Pending".equalsIgnoreCase(req.getFinalStatus())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot cancel approved or rejected requests");
                }
                marksheetRequestRepository.deleteById(id);
                return ResponseEntity.ok("Deleted successfully");
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Request not found");
    }

    @GetMapping("/{type}/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String type, @PathVariable Long id) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, baos);
        document.open();

        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
        Font subTitleFont = new Font(Font.HELVETICA, 12, Font.ITALIC);
        Font normalFont = new Font(Font.HELVETICA, 11, Font.NORMAL);
        Font boldFont = new Font(Font.HELVETICA, 11, Font.BOLD);

        if ("bonafide".equalsIgnoreCase(type)) {
            Optional<BonafideRequest> op = bonafideRequestRepository.findById(id);
            if (op.isPresent()) {
                BonafideRequest req = op.get();

                Paragraph title = new Paragraph("CAMPUSHUB UNIVERSITY - BONAFIDE CERTIFICATE", titleFont);
                title.setAlignment(Element.ALIGN_CENTER);
                title.setSpacingAfter(20);
                document.add(title);

                Paragraph date = new Paragraph("Date: " + formatter.format(LocalDateTime.now()), subTitleFont);
                date.setAlignment(Element.ALIGN_RIGHT);
                date.setSpacingAfter(20);
                document.add(date);

                String text = "This is to certify that Mr./Ms. " + req.getStudentName() + 
                        ", student identification " + req.getStudentId() + 
                        ", is a bonafide student of the department of " + req.getDepartment() + 
                        " currently studying in semester " + req.getSemester() + 
                        " for the academic session 2026.\n\n" +
                        "This certificate is issued for the purpose of: " + req.getReason() + ".";
                Paragraph content = new Paragraph(text, normalFont);
                content.setSpacingAfter(40);
                document.add(content);

                Paragraph signature = new Paragraph("Academic Administrator\nCampusHub ERP Systems", boldFont);
                signature.setAlignment(Element.ALIGN_RIGHT);
                document.add(signature);

                document.close();
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Bonafide_Certificate_" + req.getStudentId() + ".pdf\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(baos.toByteArray());
            }
        } else if ("marksheet".equalsIgnoreCase(type)) {
            Optional<MarksheetRequest> op = marksheetRequestRepository.findById(id);
            if (op.isPresent()) {
                MarksheetRequest req = op.get();

                Paragraph title = new Paragraph("CAMPUSHUB UNIVERSITY - ACADEMIC TRANSCRIPT", titleFont);
                title.setAlignment(Element.ALIGN_CENTER);
                title.setSpacingAfter(20);
                document.add(title);

                Paragraph date = new Paragraph("Date: " + formatter.format(LocalDateTime.now()), subTitleFont);
                date.setAlignment(Element.ALIGN_RIGHT);
                date.setSpacingAfter(20);
                document.add(date);

                String details = "Student Name: " + req.getStudentName() + "\n" +
                                 "Roll Number: " + req.getStudentId() + "\n" +
                                 "Department: " + req.getDepartment() + "\n" +
                                 "Semester Cycle: " + req.getSemester() + "\n\n";
                Paragraph detailsPara = new Paragraph(details, boldFont);
                detailsPara.setSpacingAfter(15);
                document.add(detailsPara);

                String scores = "Academic performance summary requested for purpose of: " + req.getReason() + ".\n\n" +
                                "Subject Code | Subject Name | Credits | Grade | Status\n" +
                                "--------------------------------------------------------\n" +
                                "CS-301       | Advanced Software Engineering       | 4 | A+ | Pass\n" +
                                "CS-302       | Database Management Systems         | 4 | A  | Pass\n" +
                                "CS-303       | Computer Organization & Architecture | 3 | B  | Pass\n\n" +
                                "Cumulative GPA Score: 9.20\n";
                Paragraph scorePara = new Paragraph(scores, normalFont);
                scorePara.setSpacingAfter(40);
                document.add(scorePara);

                Paragraph signature = new Paragraph("Office of the Controller of Examinations\nCampusHub ERP Systems", boldFont);
                signature.setAlignment(Element.ALIGN_RIGHT);
                document.add(signature);

                document.close();
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Marksheet_" + req.getStudentId() + ".pdf\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(baos.toByteArray());
            }
        }
        document.close();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
