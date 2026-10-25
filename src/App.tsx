import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider, RequireRole } from './features/auth';
import { ThemeProvider } from './features/theme';
import { LanguageProvider } from './features/i18n';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Performance: Lazy-load page routes
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const ExplorePage = lazy(() => import('./pages/ExplorePage').then(m => ({ default: m.ExplorePage })));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage').then(m => ({ default: m.ListingDetailPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const TouristDashboard = lazy(() => import('./pages/TouristDashboard').then(m => ({ default: m.TouristDashboard })));
const BusinessDashboard = lazy(() => import('./pages/BusinessDashboard').then(m => ({ default: m.BusinessDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const DashboardRedirect = lazy(() => import('./pages/DashboardRedirect').then(m => ({ default: m.DashboardRedirect })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AboutContactPage = lazy(() => import('./pages/AboutContactPage').then(m => ({ default: m.AboutContactPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Scroll to top helper on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
};

// Route Fallback Loading Indicator
const RouteLoader: React.FC = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-sunset-text">
    <div className="w-10 h-10 border-3 border-sunset-accent border-t-transparent rounded-full animate-spin" />
    <span className="text-xs text-sunset-muted font-medium tracking-wide">Loading vista...</span>
  </div>
);

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
            <Router>
              <ScrollToTop />
              <div className="flex flex-col min-h-screen bg-sunset-bg text-sunset-text font-sans selection:bg-sunset-accent selection:text-sunset-on-accent transition-colors duration-200">
                <Navbar />
                
                <main className="flex-1">
                  <Suspense fallback={<RouteLoader />}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/explore" element={<ExplorePage />} />
                      <Route path="/listings/:id" element={<ListingDetailPage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/forts" element={<Navigate to="/explore?category=forts" replace />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      
                      {/* Dashboard Routes with Role Redirection & RequireRole Guards */}
                      <Route path="/dashboard" element={<DashboardRedirect />} />
                      
                      {/* Admin & Provider Direct Route Aliases */}
                      <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
                      <Route path="/sadmin" element={<Navigate to="/dashboard/admin" replace />} />
                      <Route path="/provider" element={<Navigate to="/dashboard/provider" replace />} />
                      <Route path="/business" element={<Navigate to="/dashboard/provider" replace />} />

                      <Route
                        path="/dashboard/provider"
                        element={
                          <RequireRole roles={['provider', 'admin']}>
                            <BusinessDashboard />
                          </RequireRole>
                        }
                      />
                      <Route
                        path="/dashboard/business"
                        element={
                          <RequireRole roles={['provider', 'admin']}>
                            <BusinessDashboard />
                          </RequireRole>
                        }
                      />
                      
                      <Route
                        path="/dashboard/admin"
                        element={
                          <RequireRole roles={['admin']}>
                            <AdminDashboard />
                          </RequireRole>
                        }
                      />

                      <Route path="/about" element={<AboutContactPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </main>

                <Footer />
              </div>
            </Router>
          </ToastProvider>
        </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
