import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import LandingPage from "../pages/landing/LandingPage";
import AuthRoutes from "./AuthRoutes";
import StudentRoutes from "./StudentRoutes";
import AdminRoutes from "./AdminRoutes";
import FacultyRoutes from "./FacultyRoutes";
import ProtectedRoute from "../components/common/ProtectedRoute";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";
import FacultyLayout from "../layouts/FacultyLayout";

export default function AppRoutes() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth routes (wildcard handles login pages, recovery) */}
            <Route path="/*" element={<AuthRoutes />} />

            {/* Secure student section */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRole="student">
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="*" element={<StudentRoutes />} />
            </Route>

            {/* Secure faculty section */}
            <Route
              path="/faculty/*"
              element={
                <ProtectedRoute allowedRole="faculty">
                  <FacultyLayout />
                </ProtectedRoute>
              }
            >
              <Route path="*" element={<FacultyRoutes />} />
            </Route>

            {/* Secure admin section */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="*" element={<AdminRoutes />} />
            </Route>

            {/* Global fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}