import React from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from './AuthContext';
import { UserRole } from '../../types';

export interface RequireRoleProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ roles, children, fallback }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sunset-accent">
        <span className="text-sm font-semibold">Verifying permissions...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" state={{ from: location }} replace />;
  }

  const isAdminEmail = user.email?.toLowerCase().includes('admin');
  const effectiveRole: UserRole = (isAdminEmail || user.role === 'admin' || role === 'admin') ? 'admin' : 'provider';

  if (!roles.includes(effectiveRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen pt-32 pb-20 px-4 max-w-2xl mx-auto text-center space-y-6 text-sunset-text">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold font-serif text-sunset-text">Access Restricted</h1>
        <p className="text-sm text-sunset-muted">
          Your current account role (<span className="capitalize font-semibold text-sunset-accent">{role}</span>) does not have privileges to view this area. Allowed roles: {roles.join(', ')}.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link to="/" className="btn-accent px-6 py-2.5 text-xs">Return to Home</Link>
          <Link to="/dashboard" className="px-6 py-2.5 glass-panel rounded-xl text-xs text-sunset-text border border-sunset-border">
            My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
