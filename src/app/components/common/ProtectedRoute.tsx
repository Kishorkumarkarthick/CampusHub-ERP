import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "./Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: "student" | "admin" | "faculty";
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullPage />;
  }

  if (!isAuthenticated || !user) {
    // Redirect unauthenticated access to proper login path
    return <Navigate to={allowedRole === "admin" ? "/admin-login" : "/student-login"} replace />;
  }

  const isAllowed = 
    user.role === allowedRole || 
    (allowedRole === "student" && user.role === "faculty");

  if (!isAllowed) {
    // Redirect role mismatch to their correct home dashboard if logged in
    if (user.role === "student") {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user.role === "faculty") {
      return <Navigate to="/faculty/dashboard" replace />;
    } else if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
