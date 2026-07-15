import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import FacultyDashboard from "../pages/faculty/Dashboard";
import FacultyProfile from "../pages/faculty/Profile";
import FacultySubjects from "../pages/faculty/Subjects";
import FacultyTimetable from "../pages/faculty/Timetable";
import FacultyAttendance from "../pages/faculty/Attendance";
import FacultyMarks from "../pages/faculty/Marks";
import FacultyApprovals from "../pages/faculty/FacultyApprovals";

export default function FacultyRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<FacultyDashboard />} />
      <Route path="profile" element={<FacultyProfile />} />
      <Route path="subjects" element={<FacultySubjects />} />
      <Route path="timetable" element={<FacultyTimetable />} />
      <Route path="attendance" element={<FacultyAttendance />} />
      <Route path="marks" element={<FacultyMarks />} />
      <Route path="requests" element={<FacultyApprovals />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
