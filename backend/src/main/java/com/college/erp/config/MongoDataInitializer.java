package com.college.erp.config;

import com.college.erp.model.*;
import com.college.erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MongoDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final CourseRepository courseRepository;
    private final InvoiceRepository invoiceRepository;
    private final TransactionRepository transactionRepository;
    private final ExamScheduleRepository examScheduleRepository;
    private final ExamMarksRepository examMarksRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final TimetableRepository timetableRepository;
    private final BookRepository bookRepository;
    private final AnnouncementRepository announcementRepository;
    private final NotificationRepository notificationRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ActivityLogRepository activityLogRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final LibraryRepository libraryRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String[] SOUTH_INDIAN_STUDENT_NAMES = {
        "Adithya Krishnan", "Rajesh Kannan", "Sanjay Srinivasan", "Meera Nair", "Divya Pillai",
        "Priya Sundaram", "Hari Prasath", "Karthik Raja", "Ganesh Venkat", "Balaji Viswanathan",
        "Arun Karthik", "Vikram Ramachandran", "Siddharth Srinivasan", "Vijay Raghavan", "Sanjay Balaji",
        "Ananya Iyer", "Shruthi Iyer", "Meera Nair", "Divya Pillai", "Priya Sundaram",
        "Ravi Chandran", "Hari Prasath", "Karthik Raja", "Manoj Kumar", "Ganesh Venkat",
        "Pooja Hegde", "Deepika Padukone", "Sindhu Rajan", "Lakshmi Narayanan", "Balaji Viswanathan",
        "Rahul Dravid", "Anil Kumble", "Javagal Srinath", "Venkatesh Prasad", "Ravichandran Ashwin",
        "Dinesh Karthik", "Muralidharan", "Sanju Samson", "Sai Kishore", "Washington Sundar",
        "Sai Sudharsan", "Sharath Kamal", "Viswanathan Anand", "Praggnanandhaa", "Gukesh Dommaraju",
        "Harikrishna", "Srinath Narayanan", "Adhiban", "Vidit Gujrathi", "Arjun Erigaisi",
        "Hariharan", "Unnikrishnan", "Karthik Netha", "Shreya Ghoshal", "Chinmayi Sripada",
        "Haricharan", "Vijay Yesudas", "Sathya Prakash", "Sid Sriram", "Pradeep Kumar",
        "Dhibu Ninan Thomas", "Santhosh Narayanan", "Anirudh Ravichander", "Yuvan Shankar Raja", "Harris Jayaraj",
        "G. V. Prakash", "Devi Sri Prasad", "Vidya Sagar", "M. M. Keeravani", "Ilayaraja",
        "A. R. Rahman", "Madhavan", "Kamal Haasan", "Rajinikanth", "Suriya Sivakumar",
        "Karthi Sivakumar", "Vikram Kennedy", "Vijay Chandrasekhar", "Ajith Kumar", "Dhanush K Raja",
        "Sivakarthikeyan", "Vijay Sethupathi", "Jayam Ravi", "Jiiva", "Arya",
        "Vishal Krishna", "Karthi", "Siddharth", "Prithviraj Sukumaran", "Dulquer Salmaan",
        "Fahadh Faasil", "Nivin Pauly", "Tovino Thomas", "Unni Mukundan", "Asif Ali",
        "Kunchacko Boban", "Joju George", "Biju Menon", "Suraj Venjaramoodu"
    };

    private static final String[] SOUTH_INDIAN_FACULTY_NAMES = {
        "Dr. Padmanabhan Nair", "Dr. Meenakshi Sundaram", "Dr. Venkatasubramanian", "Dr. Srinivasan Ramasamy", "Dr. Soundararajan",
        "Prof. Swaminathan", "Dr. Chidambaram Raman", "Dr. Ranganathan Iyer", "Prof. Kalyanasundaram", "Dr. Gayatri Venkataraman",
        "Dr. Rajesh Kannan", "Prof. Subramanian", "Dr. Anandakrishnan", "Dr. Radhakrishnan", "Dr. Ramanujam",
        "Dr. Chandrasekhar", "Dr. Venkatraman", "Dr. Krishnaswamy", "Prof. Vasudevan", "Dr. Parthasarathy"
    };

    private static final String[] SOUTH_INDIAN_PARENT_NAMES = {
        "Sundaramurthy Pillai", "Ranganathan Iyer", "Balaji Viswanathan", "Narayanan Nair", "Ganesan Pillai",
        "Venkataraman Swamy", "Subramanian Iyer", "Kalyanasundaram", "Krishnaswamy Nair", "Parthasarathy Swamy",
        "Vasudevan Pillai", "Ramachandran Iyer", "Srinivasan Swamy", "Raghavan Nair", "Soundararajan Pillai",
        "Rajagopalan Iyer", "Balasubramanian", "Chidambaram Pillai", "Anandakrishnan Swamy", "Radhakrishnan Nair"
    };

    @Override
    public void run(String... args) throws Exception {
        String defaultPasswordHash = passwordEncoder.encode("password123");

        // 1. Generate 10 Admins
        String[] adminEmails = {
            "admin@college.edu",
            "superadmin@campushub.edu",
            "academic@campushub.edu",
            "finance@campushub.edu",
            "library@campushub.edu",
            "placement@campushub.edu",
            "admin1@campushub.edu",
            "admin2@campushub.edu",
            "admin3@campushub.edu",
            "admin4@campushub.edu"
        };
        for (String email : adminEmails) {
            if (userRepository.findByEmail(email).isEmpty()) {
                userRepository.save(User.builder().email(email).password(defaultPasswordHash).role(Role.ADMIN).build());
            }
        }

        // 2. Generate 20 Faculty (1 primary + 19 generated)
        if (userRepository.findByEmail("faculty@college.edu").isEmpty()) {
            userRepository.save(User.builder().email("faculty@college.edu").password(defaultPasswordHash).role(Role.FACULTY).build());
        }
        if (facultyRepository.findByEmail("faculty@college.edu").isEmpty()) {
            facultyRepository.save(Faculty.builder()
                    .name("Prof. Saradha Krishnan")
                    .employeeId("EMP-CS-201")
                    .email("faculty@college.edu")
                    .phone("+1 (555) 111-2222")
                    .department("Computer Science & Engineering")
                    .designation("Associate Professor")
                    .status("Active")
                    .joiningYear(2018)
                    .avatar("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                    .qualification("Ph.D. in Computer Science")
                    .experience("15 Years")
                    .subjectsAssigned("CS-301, CS-302")
                    .officeRoom("Room 201, LHC Block")
                    .officeHours("Mon-Wed 10:00 AM - 12:00 PM")
                    .address("14 Faculty Lane, CampusHub")
                    .bloodGroup("O-")
                    .joiningDate("August 1, 2018")
                    .build());
        }

        String[] depts = {
            "Computer Science & Engineering", "Electrical Engineering", "Mechanical Engineering",
            "Business Administration", "Civil Engineering", "Electronics & Communication",
            "Information Technology", "Chemical Engineering", "Aerospace Engineering", "Physics & Materials Science"
        };

        for (int i = 1; i <= 19; i++) {
            String email = "faculty" + i + "@campushub.edu";
            if (userRepository.findByEmail(email).isEmpty()) {
                String passwordHash = passwordEncoder.encode("faculty" + i + "@123");
                userRepository.save(User.builder().email(email).password(passwordHash).role(Role.FACULTY).build());
            }
            if (facultyRepository.findByEmail(email).isEmpty()) {
                facultyRepository.save(Faculty.builder()
                        .name(SOUTH_INDIAN_FACULTY_NAMES[(i - 1) % SOUTH_INDIAN_FACULTY_NAMES.length])
                        .employeeId("EMP-CS-30" + i)
                        .email(email)
                        .phone("+91 98765 9990" + (i - 1))
                        .department(depts[(i - 1) % depts.length])
                        .designation("Assistant Professor")
                        .status("Active")
                        .joiningYear(2020)
                        .avatar("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                        .qualification("Ph.D. in software/systems")
                        .experience("8 Years")
                        .subjectsAssigned("Core Subjects")
                        .officeRoom("Room 30" + i + ", Science Block")
                        .officeHours("Tue-Thu 3:00 PM - 5:00 PM")
                        .address("Faculty Quarter " + i)
                        .bloodGroup("B+")
                        .joiningDate("July 15, 2020")
                        .build());
            }
        }

        // 3. Generate 100 Students (1 primary + 99 generated)
        if (userRepository.findByEmail("student@college.edu").isEmpty()) {
            userRepository.save(User.builder().email("student@college.edu").password(defaultPasswordHash).role(Role.STUDENT).build());
        }
        if (studentRepository.findByEmail("student@college.edu").isEmpty()) {
            studentRepository.save(Student.builder()
                    .name("Kishore Kumar")
                    .rollNo("2023CS1045")
                    .email("student@college.edu")
                    .phone("+1 (555) 019-2834")
                    .department("Computer Science & Engineering")
                    .semester("5th Semester")
                    .cgpa(9.20)
                    .admissionYear(2023)
                    .avatar("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150")
                    .studentYear("3rd Year")
                    .section("Section A")
                    .address("No. 12, Gandhi Street, Chennai")
                    .bloodGroup("AB+")
                    .parentName("Maniam Sundaram")
                    .parentPhone("+1 (555) 019-9021")
                    .mentor("Prof. Saradha Krishnan")
                    .batch("2023 - 2027")
                    .build());
        }

        for (int i = 1; i <= 99; i++) {
            String email = "student" + i + "@campushub.edu";
            if (userRepository.findByEmail(email).isEmpty()) {
                String passwordHash = passwordEncoder.encode("student" + i + "@123");
                userRepository.save(User.builder().email(email).password(passwordHash).role(Role.STUDENT).build());
            }
            if (studentRepository.findByEmail(email).isEmpty()) {
                studentRepository.save(Student.builder()
                        .name(SOUTH_INDIAN_STUDENT_NAMES[(i - 1) % SOUTH_INDIAN_STUDENT_NAMES.length])
                        .rollNo("CH2026CS" + (1000 + i))
                        .email(email)
                        .phone("+91 98765 4321" + (i % 10))
                        .department(depts[i % depts.length])
                        .semester("3rd Semester")
                        .cgpa(7.5 + (i % 25) * 0.1)
                        .admissionYear(2024)
                        .avatar("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150")
                        .studentYear("2nd Year")
                        .section("Section " + (char)('A' + (i % 3)))
                        .address("Campus Hostel, Room " + (100 + i))
                        .bloodGroup("A+")
                        .parentName(SOUTH_INDIAN_PARENT_NAMES[(i - 1) % SOUTH_INDIAN_PARENT_NAMES.length])
                        .parentPhone("+91 98765 0000" + (i % 10))
                        .mentor(SOUTH_INDIAN_FACULTY_NAMES[(i - 1) % SOUTH_INDIAN_FACULTY_NAMES.length])
                        .batch("2024 - 2028")
                        .build());
            }
        }

        // 4. Generate 10 Departments
        if (departmentRepository.count() == 0) {
            String[] hodNames = {
                "Prof. Saradha Krishnan", "Dr. Ramachandran Pillai", "Dr. Meenakshi Sundaram", "Dr. Anandakrishnan",
                "Dr. Venkatraman", "Dr. Krishnaswamy", "Dr. Gayatri Venkataraman", "Dr. Padmanabhan Nair",
                "Dr. Soundararajan", "Dr. Chidambaram Raman"
            };
            String[] blockNames = {
                "Main Block, LHC-200", "EE Lab Block, LHC-100", "Workshop Block, LHC-300", "Management Tower, LHC-400",
                "Civil Block, LHC-500", "ECE Lab Block, LHC-150", "IT Center, LHC-250", "Chemical Lab, LHC-350",
                "Aerospace Center, LHC-450", "Physics Block, LHC-550"
            };
            String[] codes = {"CSE", "EE", "ME", "BA", "CE", "ECE", "IT", "CHE", "AE", "PMS"};

            for (int i = 0; i < 10; i++) {
                departmentRepository.save(Department.builder()
                        .code(codes[i])
                        .name(depts[i])
                        .hod(hodNames[i])
                        .block(blockNames[i])
                        .facultiesCount(10 + i * 2)
                        .studentsCount(150 + i * 20)
                        .build());
            }
        }

        // 4b. Generate Courses
        if (courseRepository.count() == 0) {
            String[] hodNames = {
                "Prof. Saradha Krishnan", "Dr. Ramachandran Pillai", "Dr. Meenakshi Sundaram", "Dr. Anandakrishnan",
                "Dr. Venkatraman", "Dr. Krishnaswamy", "Dr. Gayatri Venkataraman", "Dr. Padmanabhan Nair",
                "Dr. Soundararajan", "Dr. Chidambaram Raman"
            };
            String[] courseCodes = {
                "CS-301", "CS-302", "CS-303", "CS-304", "CS-305", "CS-306", "CS-401", "CS-402",
                "EE-101", "EE-201",
                "ME-201", "ME-301",
                "BA-101", "BA-102",
                "CE-101", "CE-201",
                "ECE-201", "ECE-202",
                "IT-301", "IT-302",
                "CHE-201", "CHE-202",
                "AE-301", "AE-302",
                "PMS-101", "PMS-201"
            };
            String[] courseNames = {
                "Advanced Software Engineering", "Database Management Systems", "Computer Organization & Architecture",
                "Design & Analysis of Algorithms", "Operating Systems", "Compiler Design", "Machine Learning", "Cloud Computing",
                "Basic Electrical Engineering", "Analog Circuits",
                "Thermodynamics", "Fluid Mechanics",
                "Principles of Management", "Financial Accounting",
                "Strength of Materials", "Structural Analysis & Design",
                "Signals and Systems", "Digital Communication Systems",
                "Web Technologies", "Information Security",
                "Chemical Reaction Engineering", "Mass Transfer Operations",
                "Aerodynamics", "Flight Mechanics & Control",
                "Quantum Mechanics", "Solid State & Materials Physics"
            };
            String[] courseDepts = {
                "Computer Science & Engineering", "Computer Science & Engineering", "Computer Science & Engineering",
                "Computer Science & Engineering", "Computer Science & Engineering", "Computer Science & Engineering",
                "Computer Science & Engineering", "Computer Science & Engineering",
                "Electrical Engineering", "Electrical Engineering",
                "Mechanical Engineering", "Mechanical Engineering",
                "Business Administration", "Business Administration",
                "Civil Engineering", "Civil Engineering",
                "Electronics & Communication", "Electronics & Communication",
                "Information Technology", "Information Technology",
                "Chemical Engineering", "Chemical Engineering",
                "Aerospace Engineering", "Aerospace Engineering",
                "Physics & Materials Science", "Physics & Materials Science"
            };

            for (int i = 0; i < courseCodes.length; i++) {
                String dept = courseDepts[i];
                int deptIdx = 0;
                for (int d = 0; d < depts.length; d++) {
                    if (depts[d].equals(dept)) {
                        deptIdx = d;
                        break;
                    }
                }
                String facultyName = hodNames[deptIdx % hodNames.length];
                courseRepository.save(Course.builder()
                        .code(courseCodes[i])
                        .name(courseNames[i])
                        .department(dept)
                        .credits(3 + (i % 2))
                        .duration("1 Semester")
                        .faculty(facultyName)
                        .studentCount(30 + (i * 3))
                        .status("Active")
                        .syllabus(List.of("Module 1: Introduction", "Module 2: Advanced Topics", "Module 3: Case Studies"))
                        .build());
            }
        }

        // 5. Generate Fee Records
        if (invoiceRepository.count() == 0) {
            invoiceRepository.save(Invoice.builder()
                    .invoiceNumber("INV-2026-001")
                    .studentName("Kishore Kumar")
                    .rollNo("2023CS1045")
                    .department("Computer Science & Engineering")
                    .amount(1250.0)
                    .dueDate("2026-08-15")
                    .status("Pending")
                    .build());

            invoiceRepository.save(Invoice.builder()
                    .invoiceNumber("INV-2026-002")
                    .studentName(SOUTH_INDIAN_STUDENT_NAMES[0])
                    .rollNo("CH2026CS1001")
                    .department("Computer Science & Engineering")
                    .amount(1250.0)
                    .dueDate("2026-08-15")
                    .status("Paid")
                    .build());

            transactionRepository.save(Transaction.builder()
                    .txnNumber("TXN-98210")
                    .invoiceNumber("INV-2026-002")
                    .studentName(SOUTH_INDIAN_STUDENT_NAMES[0])
                    .date("2026-06-01")
                    .amount(1250.0)
                    .method("Credit Card")
                    .status("Success")
                    .build());

            for (int i = 2; i <= 20; i++) {
                String invoiceNo = "INV-2026-0" + (100 + i);
                String roll = "CH2026CS10" + (10 + i);
                invoiceRepository.save(Invoice.builder()
                        .invoiceNumber(invoiceNo)
                        .studentName(SOUTH_INDIAN_STUDENT_NAMES[(i - 1) % SOUTH_INDIAN_STUDENT_NAMES.length])
                        .rollNo(roll)
                        .department("Computer Science & Engineering")
                        .amount(1500.0)
                        .dueDate("2026-09-01")
                        .status(i % 2 == 0 ? "Paid" : "Pending")
                        .build());

                if (i % 2 == 0) {
                    transactionRepository.save(Transaction.builder()
                            .txnNumber("TXN-98" + (210 + i))
                            .invoiceNumber(invoiceNo)
                            .studentName(SOUTH_INDIAN_STUDENT_NAMES[(i - 1) % SOUTH_INDIAN_STUDENT_NAMES.length])
                            .date("2026-06-15")
                            .amount(1500.0)
                            .method("Net Banking")
                            .status("Success")
                            .build());
                }
            }
        }

        // 6. Exam Schedules and Results
        if (examScheduleRepository.count() == 0) {
            examScheduleRepository.save(ExamSchedule.builder()
                    .code("CS-301")
                    .name("Advanced Software Engineering")
                    .date("2026-09-10")
                    .time("09:30 AM - 12:30 PM")
                    .room("LH-101")
                    .maxMarks(100)
                    .build());
        }

        if (examMarksRepository.count() == 0) {
            examMarksRepository.save(ExamMarks.builder()
                    .studentName("Kishore Kumar")
                    .rollNo("2023CS1045")
                    .department("Computer Science & Engineering")
                    .marks(92)
                    .grade("A+")
                    .status("Pass")
                    .subjectCode("CS-301")
                    .build());

            for (int i = 1; i <= 15; i++) {
                examMarksRepository.save(ExamMarks.builder()
                        .studentName(SOUTH_INDIAN_STUDENT_NAMES[(i - 1) % SOUTH_INDIAN_STUDENT_NAMES.length])
                        .rollNo("CH2026CS100" + i)
                        .department("Computer Science & Engineering")
                        .marks(70 + (i % 6) * 5)
                        .grade("A")
                        .status("Pass")
                        .subjectCode("CS-301")
                        .build());
            }
        }

        // 7. Subjects
        if (subjectRepository.count() == 0) {
            subjectRepository.save(Subject.builder().code("CS301").name("Data Structures & Algorithms").department("Computer Science & Engineering").semester("3rd Semester").credits(4).instructor("Prof. Saradha Krishnan").build());
            subjectRepository.save(Subject.builder().code("CS302").name("Database Management Systems").department("Computer Science & Engineering").semester("3rd Semester").credits(4).instructor("Dr. Ramachandran Pillai").build());
            subjectRepository.save(Subject.builder().code("CS303").name("Computer Organization & Architecture").department("Computer Science & Engineering").semester("3rd Semester").credits(3).instructor("Prof. Alagappan Sundaram").build());
            subjectRepository.save(Subject.builder().code("EE101").name("Basic Electrical Engineering").department("Electrical Engineering").semester("1st Semester").credits(4).instructor("Dr. Ramachandran Pillai").build());
            subjectRepository.save(Subject.builder().code("ME201").name("Thermodynamics").department("Mechanical Engineering").semester("3rd Semester").credits(4).instructor("Dr. Meenakshi Sundaram").build());
        }

        // 8. Timetable Slots
        if (timetableRepository.count() == 0) {
            timetableRepository.save(Timetable.builder().dayOfWeek("Monday").timeSlot("09:00 AM - 10:30 AM").subjectCode("CS301").subjectName("Data Structures & Algorithms").room("LHC-201").instructor("faculty@college.edu").department("Computer Science & Engineering").semester("3rd Semester").build());
            timetableRepository.save(Timetable.builder().dayOfWeek("Monday").timeSlot("02:00 PM - 03:30 PM").subjectCode("CS303").subjectName("Computer Organization & Architecture").room("LHC-104").instructor("faculty@college.edu").department("Computer Science & Engineering").semester("3rd Semester").build());
            timetableRepository.save(Timetable.builder().dayOfWeek("Tuesday").timeSlot("11:00 AM - 12:30 PM").subjectCode("CS302").subjectName("Database Management Systems").room("LHC-202").instructor("faculty@college.edu").department("Computer Science & Engineering").semester("3rd Semester").build());
        }

        // 9. Books
        if (bookRepository.count() == 0) {
            bookRepository.save(Book.builder().isbn("978-0131103627").title("The C Programming Language").author("Brian W. Kernighan, Dennis M. Ritchie").category("Computer Science").status("Available").build());
            bookRepository.save(Book.builder().isbn("978-0262033848").title("Introduction to Algorithms").author("Thomas H. Cormen").category("Computer Science").status("Borrowed").borrowedBy("Kishore Kumar").dueDate("2026-08-01").build());
            bookRepository.save(Book.builder().isbn("978-0321356680").title("Effective C++").author("Scott Meyers").category("Computer Science").status("Available").build());
        }

        // 10. Announcements / Notifications
        if (announcementRepository.count() == 0) {
            announcementRepository.save(Announcement.builder().title("Mid-Semester Examination Timetable - Fall 2026").category("Exams").sender("Office of the Registrar").content("Schedules for all evaluations are now online. Check details in exam portal.").priority("High").date("2026-07-13").build());
        }
        if (notificationRepository.count() == 0) {
            notificationRepository.save(Notification.builder().userEmail("student@college.edu").title("Welcome to CampusHub").message("Your account is active. Explore your dashboard!").date("2026-07-15 09:00").isRead(false).build());
        }

        // 11. Helper Entities
        if (leaveRequestRepository.count() == 0) {
            leaveRequestRepository.save(LeaveRequest.builder().requesterEmail("student@college.edu").requesterRole("student").startDate("2026-07-20").endDate("2026-07-22").reason("Family function").status("Pending").build());
        }
        if (activityLogRepository.count() == 0) {
            activityLogRepository.save(ActivityLog.builder().userEmail("admin@college.edu").action("DATABASE_INITIALIZATION").details("Successfully generated MongoDB mock dataset.").timestamp(LocalDateTime.now()).build());
        }
        if (systemSettingRepository.count() == 0) {
            systemSettingRepository.save(SystemSetting.builder().key("maintenance_mode").value("false").description("Toggle general maintenance block").build());
        }
        if (libraryRepository.count() == 0) {
            libraryRepository.save(Library.builder().studentRollNo("2023CS1045").membershipStatus("Active").booksBorrowedCount(1).fineAmount(0.0).build());
        }

        // Ensure courses are seeded properly for all 10 departments
        if (courseRepository.count() < 26) {
            courseRepository.deleteAll();
            String[] hodNames = {
                "Prof. Saradha Krishnan", "Dr. Ramachandran Pillai", "Dr. Meenakshi Sundaram", "Dr. Anandakrishnan",
                "Dr. Venkatraman", "Dr. Krishnaswamy", "Dr. Gayatri Venkataraman", "Dr. Padmanabhan Nair",
                "Dr. Soundararajan", "Dr. Chidambaram Raman"
            };
            String[] newCourseCodes = {
                "CS-301", "CS-302", "CS-303", "CS-304", "CS-305", "CS-306", "CS-401", "CS-402",
                "EE-101", "EE-201",
                "ME-201", "ME-301",
                "BA-101", "BA-102",
                "CE-101", "CE-201",
                "ECE-201", "ECE-202",
                "IT-301", "IT-302",
                "CHE-201", "CHE-202",
                "AE-301", "AE-302",
                "PMS-101", "PMS-201"
            };
            String[] newCourseNames = {
                "Advanced Software Engineering", "Database Management Systems", "Computer Organization & Architecture",
                "Design & Analysis of Algorithms", "Operating Systems", "Compiler Design", "Machine Learning", "Cloud Computing",
                "Basic Electrical Engineering", "Analog Circuits",
                "Thermodynamics", "Fluid Mechanics",
                "Principles of Management", "Financial Accounting",
                "Strength of Materials", "Structural Analysis & Design",
                "Signals and Systems", "Digital Communication Systems",
                "Web Technologies", "Information Security",
                "Chemical Reaction Engineering", "Mass Transfer Operations",
                "Aerodynamics", "Flight Mechanics & Control",
                "Quantum Mechanics", "Solid State & Materials Physics"
            };
            String[] newCourseDepts = {
                "Computer Science & Engineering", "Computer Science & Engineering", "Computer Science & Engineering",
                "Computer Science & Engineering", "Computer Science & Engineering", "Computer Science & Engineering",
                "Computer Science & Engineering", "Computer Science & Engineering",
                "Electrical Engineering", "Electrical Engineering",
                "Mechanical Engineering", "Mechanical Engineering",
                "Business Administration", "Business Administration",
                "Civil Engineering", "Civil Engineering",
                "Electronics & Communication", "Electronics & Communication",
                "Information Technology", "Information Technology",
                "Chemical Engineering", "Chemical Engineering",
                "Aerospace Engineering", "Aerospace Engineering",
                "Physics & Materials Science", "Physics & Materials Science"
            };

            for (int i = 0; i < newCourseCodes.length; i++) {
                String dept = newCourseDepts[i];
                int deptIdx = 0;
                for (int d = 0; d < depts.length; d++) {
                    if (depts[d].equals(dept)) {
                        deptIdx = d;
                        break;
                    }
                }
                String facultyName = hodNames[deptIdx % hodNames.length];
                courseRepository.save(Course.builder()
                        .code(newCourseCodes[i])
                        .name(newCourseNames[i])
                        .department(dept)
                        .credits(3 + (i % 2))
                        .duration("1 Semester")
                        .faculty(facultyName)
                        .studentCount(30 + (i * 3))
                        .status("Active")
                        .syllabus(List.of("Module 1: Introduction", "Module 2: Advanced Topics", "Module 3: Case Studies"))
                        .build());
            }
        }
    }
}
