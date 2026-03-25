import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function RoleRedirect() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-safari-sand">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safari-green"></div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  switch (profile.role) {
    case 'admin':
    case 'sales_manager':
      return <Navigate to="/admin/dashboard" replace />;
    case 'sales':
      return <Navigate to="/admin/customers" replace />;
    case 'marketing_manager':
      return <Navigate to="/admin/marketing" replace />;
    case 'support':
      return <Navigate to="/admin/complaints" replace />;
    default:
      return <Navigate to="/admin/dashboard" replace />;
  }
}
