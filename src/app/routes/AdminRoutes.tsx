import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../pages/admin/Dashboard";
import Students from "../pages/admin/Students";
import Faculty from "../pages/admin/Faculty";
import Courses from "../pages/admin/Courses";
import Attendance from "../pages/admin/Attendance";
import Exams from "../pages/admin/Exams";
import Fees from "../pages/admin/Fees";
import Departments from "../pages/admin/Departments";
import Subjects from "../pages/admin/Subjects";
import Library from "../pages/admin/Library";
import Announcements from "../pages/admin/Announcements";
import Timetable from "../pages/admin/Timetable";
import Reports from "../pages/admin/Reports";
import Placements from "../pages/admin/Placements";
import Settings from "../pages/admin/Settings";
import AdminApprovals from "../pages/admin/AdminApprovals";

export default function AdminRoutes() {
  const { user } = useAuth();
  
  const subRole = user?.subRole || (
    user?.email?.toLowerCase().includes("academic") ? "academic" :
    user?.email?.toLowerCase().includes("finance") ? "finance" :
    user?.email?.toLowerCase().includes("library") ? "library" :
    user?.email?.toLowerCase().includes("placement") ? "placement" :
    "super"
  );

  const isAllowed = (allowedRoles: string[]) => {
    return allowedRoles.includes(subRole);
  };

  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="settings" element={<Settings />} />
      
      {isAllowed(["super", "academic"]) && (
        <>
          <Route path="students" element={<Students />} />
          <Route path="faculty" element={<Faculty />} />
          <Route path="departments" element={<Departments />} />
          <Route path="courses" element={<Courses />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="exams" element={<Exams />} />
          <Route path="requests" element={<AdminApprovals />} />
        </>
      )}

      {isAllowed(["super", "finance"]) && (
        <Route path="fees" element={<Fees />} />
      )}

      {isAllowed(["super", "library"]) && (
        <Route path="library" element={<Library />} />
      )}

      {isAllowed(["super", "placement"]) && (
        <Route path="placements" element={<Placements />} />
      )}

      {isAllowed(["super"]) && (
        <Route path="announcements" element={<Announcements />} />
      )}

      {isAllowed(["super", "finance", "library", "placement"]) && (
        <Route path="reports" element={<Reports />} />
      )}

      {/* Catch-all to redirect back to dashboard */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}
