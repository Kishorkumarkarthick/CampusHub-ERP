import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPassword from "../pages/auth/ForgotPassword";

export default function AuthRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        {/* Unified Login page */}
        <Route path="login" element={<LoginPage />} />

        {/* Multi-step forgot password, OTP and reset workflow */}
        <Route path="forgot-password" element={<ForgotPassword />} />

        {/* Legacy redirect pathways */}
        <Route path="student-login" element={<Navigate to="/login?role=student" replace />} />
        <Route path="admin-login" element={<Navigate to="/login?role=admin" replace />} />

        {/* Fallback to default login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
}
