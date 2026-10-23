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

  if (role === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (role === 'provider') {
    return <Navigate to="/dashboard/provider" replace />;
  }

  return <Navigate to="/dashboard/tourist" replace />;
};
