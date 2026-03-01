import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'admin' | 'parent';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    // Redirect to the appropriate login page
    const loginPath = allowedRole === 'admin' ? '/admin/login' : '/parent/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (userRole !== allowedRole) {
    // Redirect to the appropriate login page if role doesn't match
    const loginPath = allowedRole === 'admin' ? '/admin/login' : '/parent/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
