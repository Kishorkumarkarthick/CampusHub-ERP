import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import StudentDashboard from "../pages/student/Dashboard";
import Profile from "../pages/student/Profile";
import Attendance from "../pages/student/Attendance";
import Results from "../pages/student/Results";
import Fees from "../pages/student/Fees";
import Library from "../pages/student/Library";
import Announcements from "../pages/student/Announcements";
import Settings from "../pages/student/Settings";
import Timetable from "../pages/student/Timetable";
import StudentRequests from "../pages/student/StudentRequests";

export default function StudentRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="profile" element={<Profile />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="timetable" element={<Timetable />} />
      <Route path="results" element={<Results />} />
      <Route path="fees" element={<Fees />} />
      <Route path="library" element={<Library />} />
      <Route path="announcements" element={<Announcements />} />
      <Route path="settings" element={<Settings />} />
      <Route path="requests" element={<StudentRequests />} />
      {/* Catch-all to redirect back to dashboard */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
