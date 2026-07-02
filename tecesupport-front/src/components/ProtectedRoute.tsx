import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import {
  getDefaultRoute,
  getStoredUser,
  hasAccessToken,
  type UserRole,
} from "../auth/session";

type ProtectedRouteProps = {
  allowedRoles?: UserRole[];
  children: ReactNode;
};

export default function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const user = getStoredUser();

  if (!hasAccessToken() || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return <>{children}</>;
}
