package com.college.erp.service;

import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Service
public class AIService {

    public String generateReply(String role, String message) {
        String geminiApiKey = System.getenv("GEMINI_API_KEY");
        String openaiApiKey = System.getenv("OPENAI_API_KEY");

        String systemPrompt = getSystemPrompt(role);

        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            String reply = callGemini(geminiApiKey, systemPrompt, message);
            if (reply != null) return reply;
        }

        if (openaiApiKey != null && !openaiApiKey.trim().isEmpty()) {
            String reply = callOpenAI(openaiApiKey, systemPrompt, message);
            if (reply != null) return reply;
        }

        return callRulesFallback(role, message);
    }

    private String getSystemPrompt(String role) {
        switch (role.toLowerCase()) {
            case "faculty":
                return "You are CampusHub ERP AI Assistant. You help faculty members with timetable, assigned subjects, attendance entry, internal marks, student lists, and leave requests. Be polite, concise, and format answers in markdown.";
            case "admin":
                return "You are CampusHub ERP AI Assistant. You help administrators with user management, reports, analytics, departments, fees, and notifications. Be polite, concise, and format answers in markdown.";
            case "student":
            default:
                return "You are CampusHub ERP AI Assistant. You help students with attendance, results, fees, timetable, courses, library, and leave requests. Be polite, concise, and format answers in markdown.";
        }
    }

    private String callGemini(String apiKey, String systemPrompt, String message) {
        try {
            URL url = new URL("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            String prompt = systemPrompt + "\n\nUser Message: " + message;
            String jsonPayload = "{\"contents\": [{\"parts\": [{\"text\": \"" + escapeJson(prompt) + "\"}]}]}";

            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonPayload.getBytes("utf-8"));
            }

            int responseCode = conn.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        response.append(line);
                    }
                    return extractGeminiText(response.toString());
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini API call failed: " + e.getMessage());
        }
        return null;
    }

    private String callOpenAI(String apiKey, String systemPrompt, String message) {
        try {
            URL url = new URL("https://api.openai.com/v1/chat/completions");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setDoOutput(true);

            String jsonPayload = "{"
                    + "\"model\": \"gpt-4o-mini\","
                    + "\"messages\": ["
                    + "  {\"role\": \"system\", \"content\": \"" + escapeJson(systemPrompt) + "\"},"
                    + "  {\"role\": \"user\", \"content\": \"" + escapeJson(message) + "\"}"
                    + "]"
                    + "}";

            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonPayload.getBytes("utf-8"));
            }

            int responseCode = conn.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        response.append(line);
                    }
                    return extractOpenAiText(response.toString());
                }
            }
        } catch (Exception e) {
            System.err.println("OpenAI API call failed: " + e.getMessage());
        }
        return null;
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private String extractGeminiText(String json) {
        try {
            // Very simple JSON extraction for gemini response: "text": "..."
            int textIdx = json.indexOf("\"text\":");
            if (textIdx != -1) {
                int start = json.indexOf("\"", textIdx + 7) + 1;
                int end = json.indexOf("\"", start);
                String raw = json.substring(start, end);
                return unescapeJson(raw);
            }
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini text: " + e.getMessage());
        }
        return "Failed to parse Gemini response.";
    }

    private String extractOpenAiText(String json) {
        try {
            // Very simple JSON extraction for openai response: "content": "..."
            int contentIdx = json.indexOf("\"content\":");
            if (contentIdx != -1) {
                int start = json.indexOf("\"", contentIdx + 10) + 1;
                int end = json.indexOf("\"", start);
                String raw = json.substring(start, end);
                return unescapeJson(raw);
            }
        } catch (Exception e) {
            System.err.println("Failed to parse OpenAI text: " + e.getMessage());
        }
        return "Failed to parse OpenAI response.";
    }

    private String unescapeJson(String s) {
        return s.replace("\\n", "\n")
                .replace("\\\"", "\"")
                .replace("\\\\", "\\")
                .replace("\\r", "\r")
                .replace("\\t", "\t");
    }

    private String callRulesFallback(String role, String message) {
        String msg = message.toLowerCase();
        boolean isStudent = "student".equalsIgnoreCase(role);
        boolean isFaculty = "faculty".equalsIgnoreCase(role);
        boolean isAdmin = "admin".equalsIgnoreCase(role);

        if (isStudent) {
            if (msg.contains("attendance")) {
                return "Your current attendance stands at **88%** across all semesters, which is above the 75% minimum requirement. Keep it up!";
            } else if (msg.contains("result") || msg.contains("grade") || msg.contains("gpa") || msg.contains("cgpa") || msg.contains("marks")) {
                return "Your current CGPA is **9.15/10** with A+ grades in Data Structures and Computer Architecture. You can check the complete scorecard on the **Results Report** tab.";
            } else if (msg.contains("fee") || msg.contains("due") || msg.contains("payment")) {
                return "You have outstanding academic dues of **$2,450.00**. You can make a secure payment and view past transaction receipts on the **Fees & Dues** tab.";
            } else if (msg.contains("timetable") || msg.contains("schedule") || msg.contains("slot")) {
                return "Your classes are scheduled Monday through Friday. You have an upcoming *Data Structures & Algorithms* lecture tomorrow at 09:00 AM in LHC-201. Review your full schedule on the **Weekly Timetable** tab.";
            } else if (msg.contains("course") || msg.contains("subject") || msg.contains("syllabus")) {
                return "You are currently registered for 5 core courses: Data Structures (CS301), Database Systems (CS302), Computer Architecture (CS303), Discrete Math (CS304), and Physics (PH101).";
            } else if (msg.contains("library") || msg.contains("book") || msg.contains("isbn")) {
                return "You currently have 1 checked out book: *Introduction to Algorithms* (Thomas H. Cormen) which is due on **2026-08-01**. You can browse the rest of the catalog on the **Library Catalog** tab.";
            } else if (msg.contains("leave")) {
                return "To submit a leave request, go to **Profile** > **Settings** or contact the Academic Dean's office at dean@college.edu.";
            }
            return "Hi! I am your CampusHub AI Assistant. I can help you with your attendance, grade reports, tuition fees, timetable schedules, and library catalogs. How can I help you today?";
        } else if (isFaculty) {
            if (msg.contains("timetable") || msg.contains("schedule") || msg.contains("slot")) {
                return "You have lectures scheduled on Mondays, Tuesdays, and Wednesdays. Your next lecture is *Data Structures & Algorithms* (CS301) tomorrow at 09:00 AM in room LHC-201.";
            } else if (msg.contains("subject") || msg.contains("teach") || msg.contains("course")) {
                return "You are currently assigned to teach 2 subjects: *Data Structures & Algorithms* (CS301) and *Database Management Systems* (CS302).";
            } else if (msg.contains("attendance")) {
                return "You can record and submit daily attendance sheets for CS301 or CS302 directly on the **Attendance Registry** tab.";
            } else if (msg.contains("mark") || msg.contains("grade") || msg.contains("score")) {
                return "Mid-semester internal marks entry is currently open. You can input student scores and publish grades on the **Internal Marks** tab.";
            } else if (msg.contains("student")) {
                return "You have 45 active students enrolled in your CS301 batch. You can download the complete list and audit roll numbers on your dashboard.";
            } else if (msg.contains("leave")) {
                return "Faculty leave requests can be submitted through the staff portal settings or by notifying the Head of Department (HOD).";
            }
            return "Hello Professor! I am your CampusHub Faculty Assistant. I can help check your lecture timetable slots, assigned subjects list, attendance registries, and internal marks entries. How can I assist you today?";
        } else if (isAdmin) {
            if (msg.contains("user") || msg.contains("student") || msg.contains("faculty")) {
                return "You have administrative access to manage all student and faculty registries. You can add new profiles or edit credentials on the **Students** and **Faculty** tabs.";
            } else if (msg.contains("report") || msg.contains("analytics") || msg.contains("stat")) {
                return "All academic and financial audit reports are generated dynamically. You can view the live charts on the **Dashboard** analytics panel.";
            } else if (msg.contains("department") || msg.contains("course") || msg.contains("subject")) {
                return "You can configure academic streams, courses, and subject listings on the **Departments** and **Courses** tabs.";
            } else if (msg.contains("fee") || msg.contains("invoice")) {
                return "Tuition invoices are generated at the start of each semester. You can manage student bills and payments on the **Fees** administration tab.";
            } else if (msg.contains("notification") || msg.contains("announce")) {
                return "You can publish global announcements to all students and faculty notice boards on the **Announcements** tab.";
            }
            return "Hello Administrator! I am your CampusHub Operations Assistant. I can help audit user registrations, view enrollment analytics charts, edit department streams, configure courses, and publish announcements. How can I assist you today?";
        }

        return "I am your CampusHub ERP AI Assistant. How can I help you today?";
    }
}
