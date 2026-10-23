import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider, RequireRole } from './features/auth';
import { ThemeProvider } from './features/theme';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { AuthPage } from './pages/AuthPage';
import { FortsPage } from './pages/FortsPage';
import { TouristDashboard } from './pages/TouristDashboard';
import { BusinessDashboard } from './pages/BusinessDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { DashboardRedirect } from './pages/DashboardRedirect';
import { SettingsPage } from './pages/SettingsPage';
import { AboutContactPage } from './pages/AboutContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top helper on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-sunset-bg text-sunset-text font-sans selection:bg-sunset-accent selection:text-sunset-on-accent transition-colors duration-200">
              <Navbar />
              
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/listings/:id" element={<ListingDetailPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/forts" element={<FortsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  
                  {/* Dashboard Routes with Role Redirection & RequireRole Guards */}
                  <Route path="/dashboard" element={<DashboardRedirect />} />
                  
                  <Route
                    path="/dashboard/tourist"
                    element={
                      <RequireRole roles={['tourist', 'admin']}>
                        <TouristDashboard />
                      </RequireRole>
                    }
                  />
                  
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
              </main>

              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
