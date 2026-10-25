import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth';

export const DashboardRedirect: React.FC = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sunset-accent">
        <span className="text-sm font-semibold">Loading dashboard...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  const isAdminEmail = user.email?.toLowerCase().includes('admin');
  const effectiveRole = isAdminEmail ? 'admin' : (user.role || role);

  if (effectiveRole === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return <Navigate to="/dashboard/provider" replace />;
};
