import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const RequireAdmin: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;

  if (!isAuthenticated || (user?.role || "").toUpperCase() !== "ADMIN") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAdmin;


