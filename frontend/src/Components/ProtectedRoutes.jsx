import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../utils/auth";

/**
 * Route wrapper that only allows access to authenticated users.
 * If no token is present, redirects to the login page.
 */
export const ProtectedRoute = () => {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

/**
 * Route wrapper that only allows access to guests (unauthenticated users).
 * If a token is present, redirects to the home/dashboard page.
 */
export const GuestRoute = () => {
  const token = getToken();

  if (token) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};
