import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Compass, Mail, Lock, User, Briefcase, ArrowRight,
  CheckCircle2, AlertCircle, Building2, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../features/auth';
import { useToast } from '../components/Toast';
import {
  loginSchema, LoginFormValues,
  registerSchema, RegisterFormValues,
  forgotPasswordSchema, ForgotPasswordFormValues
} from '../features/auth/authSchema';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const fromState = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const targetDestination = fromState?.pathname
    ? `${fromState.pathname}${fromState.search || ''}`
    : '/dashboard';

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const initialRole: 'provider' | 'admin' = searchParams.get('role') === 'admin' ? 'admin' : 'provider';

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [showTokenRecovery, setShowTokenRecovery] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { user, role, loading: authLoading, signIn, signUp, signInWithGoogle, signInWithOAuthToken, resetPassword } = useAuth();

  // Redirect authenticated users and handle OAuth callback/errors cleanly
  useEffect(() => {
    // 1. Check for OAuth errors in URL query params
    const errorParam = searchParams.get('error') || searchParams.get('error_description');
    if (errorParam) {
      const desc = searchParams.get('error_description') || 'Google sign-in was cancelled or encountered an error.';
      setStatusMessage({ type: 'error', text: desc });
      toast.error(desc);
      return;
    }

    // 2. Synchronize mode tab if URL mode changes
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup' && mode !== 'signup') {
      setMode('signup');
    } else if (urlMode === 'login' && mode !== 'login') {
      setMode('login');
    }

    // 3. If authenticated user arrives, redirect to destination
    if (!authLoading && user) {
      const isGenericDestination = !fromState?.pathname || fromState.pathname === '/dashboard' || fromState.pathname === '/auth';
      const destination = !isGenericDestination
        ? `${fromState.pathname}${fromState.search || ''}`
        : (user.role === 'admin' || role === 'admin' || user.email?.toLowerCase().includes('admin') ? '/dashboard/admin' : '/dashboard/provider');

      // Only display success message if returning from an actual OAuth exchange
      const isOAuthReturn = window.location.hash.includes('access_token') || searchParams.has('code');
      if (isOAuthReturn) {
        toast.success('Signed in with Google successfully!');
      }

      navigate(destination, { replace: true });
    }
  }, [user, authLoading, role, fromState, navigate, searchParams, toast, mode]);

  // React Hook Form with Zod Resolvers
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: initialRole,
      businessName: '',
    },
  });

  const forgotForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const [selectedRole, setSelectedRole] = useState<'provider' | 'admin'>(initialRole);

  const handleRoleSelect = (role: 'provider' | 'admin') => {
    setSelectedRole(role);
    registerForm.setValue('role', role);
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setStatusMessage(null);
    setIsGoogleLoading(true);
    try {
      const res = await signInWithGoogle(selectedRole);
      if (!res.success) {
        setIsGoogleLoading(false);
        const errText = res.error || 'Google authentication failed.';
        setStatusMessage({ type: 'error', text: errText });
        toast.error(errText);
      }
      // Note: If res.success is true, the browser is redirecting to Google's OAuth portal.
      // Do not display success toast or navigate away prematurely.
    } catch (err: unknown) {
      setIsGoogleLoading(false);
      const msg = err instanceof Error ? err.message : 'Google login error';
      setStatusMessage({ type: 'error', text: msg });
      toast.error(msg);
    }
  };

  const handleRecoverToken = async () => {
    if (!tokenInput.trim()) return;
    try {
      const res = await signInWithOAuthToken(tokenInput);
      if (res.success) {
        toast.success('Successfully authenticated from Google token URL!');
        navigate(targetDestination, { replace: true });
      } else {
        toast.error(res.error || 'Failed to authenticate from token');
      }
    } catch {
      toast.error('Token authentication failed');
    }
  };

  const onLoginSubmit = async (data: LoginFormValues) => {
    setStatusMessage(null);
    try {
      const res = await signIn(data.email, data.password, selectedRole);
      if (res.success) {
        const welcomeText = selectedRole === 'admin'
          ? 'Signed in successfully! Admin privileges activated.'
          : 'Signed in successfully! Redirecting...';
        toast.success(welcomeText);
        
        const isGenericDestination = !fromState?.pathname || fromState.pathname === '/dashboard' || fromState.pathname === '/auth';
        if (!isGenericDestination) {
          navigate(`${fromState.pathname}${fromState.search || ''}`, { replace: true });
        } else {
          // Check role to direct to correct dashboard
          const storedUser = localStorage.getItem('locallens_current_user_v1');
          let userRole = selectedRole;
          if (storedUser) {
            try {
              userRole = JSON.parse(storedUser)?.role || userRole;
            } catch {
              // ignore
            }
          }
          if (selectedRole === 'admin' || data.email.toLowerCase().includes('admin')) {
            userRole = 'admin';
          }
          const destination = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/provider';
          navigate(destination, { replace: true });
        }
      } else {
        const errText = res.error || 'Invalid email or password.';
        setStatusMessage({ type: 'error', text: errText });
        toast.error(errText);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setStatusMessage({ type: 'error', text: msg });
      toast.error(msg);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setStatusMessage(null);
    try {
      const res = await signUp(data.email, data.password, data.name, selectedRole, data.businessName);
      if (res.success) {
        const welcomeText = selectedRole === 'admin'
          ? 'Welcome Administrator! Admin privileges activated.'
          : 'Provider registration submitted! Your account is pending verification by our admin team.';
        setStatusMessage({
          type: 'success',
          text: welcomeText,
        });
        toast.success(welcomeText);

        const isGenericDestination = !fromState?.pathname || fromState.pathname === '/dashboard' || fromState.pathname === '/auth';
        const destination = !isGenericDestination
          ? `${fromState.pathname}${fromState.search || ''}`
          : (selectedRole === 'admin' ? '/dashboard/admin' : '/dashboard/provider');

        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 1000);
      } else {
        const errText = res.error || 'Registration failed.';
        setStatusMessage({ type: 'error', text: errText });
        toast.error(errText);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setStatusMessage({ type: 'error', text: msg });
      toast.error(msg);
    }
  };

  const onForgotSubmit = async (data: ForgotPasswordFormValues) => {
    setStatusMessage(null);
    try {
      const res = await resetPassword(data.email);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Password reset instructions dispatched to your email.' });
        toast.success('Password reset email dispatched.');
      } else {
        const errText = res.error || 'Failed to dispatch reset email.';
        setStatusMessage({ type: 'error', text: errText });
        toast.error(errText);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setStatusMessage({ type: 'error', text: msg });
      toast.error(msg);
    }
  };



  const isSubmitting = loginForm.formState.isSubmitting || registerForm.formState.isSubmitting || forgotForm.formState.isSubmitting || isGoogleLoading;

  if (!authLoading && user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-sunset-bg text-sunset-text">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-sunset-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-sunset-muted font-medium">Redirecting to your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-24 sm:py-28 overflow-hidden bg-sunset-bg text-sunset-text">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=2000&q=80"
          alt="Mumbai Dusk"
          className="w-full h-full object-cover object-center opacity-25 filter blur-sm"
        />
        <div className="absolute inset-0 bg-sunset-bg/85" />
      </div>

      {/* Auth Card Container */}
      <div className="relative z-10 w-full max-w-xl animate-fade-in my-auto">
        <div className="glass-panel p-6 sm:p-10 rounded-3xl shadow-2xl">
          
          {/* Header Brand */}
          <div className="text-center space-y-2 mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5 group mb-2">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sunset-accent via-sunset-accent-hot to-amber-300 flex items-center justify-center shadow-lg shadow-sunset-accent/20 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 text-sunset-on-accent stroke-[2.5]" />
              </div>
              <span className="text-2xl font-bold font-serif tracking-tight text-sunset-text">
                LocalLens
              </span>
            </Link>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-sunset-text">
              {mode === 'login' ? 'Sign In to LocalLens' : mode === 'signup' ? 'Create Your Account' : 'Reset Password'}
            </h1>
            <p className="text-xs sm:text-sm text-sunset-muted">
              {mode === 'login'
                ? 'Sign in to access your dashboard, saved places, or provider portal'
                : 'Join Mumbai’s authentic verification platform as a Tourist or Provider'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-sunset-bg rounded-xl mb-6 border border-sunset-border">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStatusMessage(null);
                navigate('/auth?mode=login', { replace: true });
              }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === 'login' ? 'btn-accent shadow-md' : 'text-sunset-muted hover:text-sunset-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setStatusMessage(null);
                navigate('/auth?mode=signup', { replace: true });
              }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === 'signup' ? 'btn-accent shadow-md' : 'text-sunset-muted hover:text-sunset-text'
              }`}
            >
              Register
            </button>
          </div>

          {/* Status Notifications */}
          {statusMessage && (
            <div
              className={`mb-6 p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 ${
                statusMessage.type === 'error'
                  ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              }`}
            >
              {statusMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
              )}
              <div className="leading-snug">{statusMessage.text}</div>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              
              {/* Role Selection on Login */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-bold text-sunset-accent uppercase tracking-wider block font-serif">
                  Select Your Account Type / Portal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('provider')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      selectedRole === 'provider'
                        ? 'bg-sunset-accent/15 border-sunset-accent shadow-lg shadow-sunset-accent/10'
                        : 'bg-sunset-bg/60 border-sunset-border hover:border-sunset-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      {selectedRole === 'provider' && <div className="w-2.5 h-2.5 rounded-full bg-sunset-accent" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-sunset-text">Local Provider</p>
                      <p className="text-[11px] text-sunset-muted leading-tight mt-0.5">
                        Sign in to manage your shop, experiences & bookings
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      selectedRole === 'admin'
                        ? 'bg-sunset-accent/15 border-sunset-accent shadow-lg shadow-sunset-accent/10'
                        : 'bg-sunset-bg/60 border-sunset-border hover:border-sunset-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-sunset-accent/20 flex items-center justify-center text-sunset-accent">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      {selectedRole === 'admin' && <div className="w-2.5 h-2.5 rounded-full bg-sunset-accent" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-sunset-text">Administrator</p>
                      <p className="text-[11px] text-sunset-muted leading-tight mt-0.5">
                        Sign in with admin authority to review & govern platform
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-sunset-text mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
                  <input
                    type="email"
                    {...loginForm.register('email')}
                    placeholder="name@example.com"
                    className="w-full h-11 glass-input rounded-xl pl-10 pr-4 text-sm"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-[11px] text-red-400 mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-sunset-text">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-sunset-accent hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
                  <input
                    type="password"
                    {...loginForm.register('password')}
                    placeholder="••••••••"
                    className="w-full h-11 glass-input rounded-xl pl-10 pr-4 text-sm"
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-[11px] text-red-400 mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-accent h-12 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'signup' && (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              
              {/* Role Selection: Provider vs Admin only */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-bold text-sunset-accent uppercase tracking-wider block font-serif">
                  Select Your Account Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('provider')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      selectedRole === 'provider'
                        ? 'bg-sunset-accent/15 border-sunset-accent shadow-lg shadow-sunset-accent/10'
                        : 'bg-sunset-bg/60 border-sunset-border hover:border-sunset-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      {selectedRole === 'provider' && <div className="w-2.5 h-2.5 rounded-full bg-sunset-accent" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-sunset-text">Local Provider</p>
                      <p className="text-[11px] text-sunset-muted leading-tight mt-0.5">
                        Apply for shop listing approval. Admin verification required.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      selectedRole === 'admin'
                        ? 'bg-sunset-accent/15 border-sunset-accent shadow-lg shadow-sunset-accent/10'
                        : 'bg-sunset-bg/60 border-sunset-border hover:border-sunset-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-sunset-accent/20 flex items-center justify-center text-sunset-accent">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      {selectedRole === 'admin' && <div className="w-2.5 h-2.5 rounded-full bg-sunset-accent" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-sunset-text">Administrator</p>
                      <p className="text-[11px] text-sunset-muted leading-tight mt-0.5">
                        Review provider applications, approve shops & platform governance
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-sunset-text mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
                  <input
                    type="text"
                    {...registerForm.register('name')}
                    placeholder="e.g. Arun Kumar"
                    className="w-full h-11 glass-input rounded-xl pl-10 pr-4 text-sm"
                  />
                </div>
                {registerForm.formState.errors.name && (
                  <p className="text-[11px] text-red-400 mt-1">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              {selectedRole === 'provider' && (
                <div>
                  <label className="text-xs font-semibold text-sunset-text mb-1.5 block">Business / Establishment Name</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
                    <input
                      type="text"
                      {...registerForm.register('businessName')}
                      placeholder="e.g. Marine Sunset Cafe & Eatery"
                      className="w-full h-11 glass-input rounded-xl pl-10 pr-4 text-sm"
                    />
                  </div>
                  {registerForm.formState.errors.businessName && (
                    <p className="text-[11px] text-red-400 mt-1">{registerForm.formState.errors.businessName.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-sunset-text mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
                  <input
                    type="email"
                    {...registerForm.register('email')}
                    placeholder="name@example.com"
                    className="w-full h-11 glass-input rounded-xl pl-10 pr-4 text-sm"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="text-[11px] text-red-400 mt-1">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-sunset-text mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
                  <input
                    type="password"
                    {...registerForm.register('password')}
                    placeholder="••••••••"
                    className="w-full h-11 glass-input rounded-xl pl-10 pr-4 text-sm"
                  />
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-[11px] text-red-400 mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-accent h-12 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Registering...' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-sunset-text mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sunset-muted" />
                  <input
                    type="email"
                    {...forgotForm.register('email')}
                    placeholder="name@example.com"
                    className="w-full h-11 glass-input rounded-xl pl-10 pr-4 text-sm"
                  />
                </div>
                {forgotForm.formState.errors.email && (
                  <p className="text-[11px] text-red-400 mt-1">{forgotForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-accent h-12 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Sending...' : 'Send Reset Email'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Social Auth Option: Google Sign In */}
          {mode !== 'forgot' && (
            <div className="mt-5 space-y-4">
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sunset-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-sunset-surface px-3 text-sunset-muted font-semibold tracking-wider text-[11px]">
                    or continue with
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleGoogleSignIn}
                  className="w-full h-12 rounded-xl bg-sunset-bg/90 border border-sunset-border hover:border-sunset-accent hover:bg-sunset-bg text-sunset-text text-sm font-semibold flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-sunset-accent border-t-transparent rounded-full animate-spin" />
                      <span>Connecting to Google...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Google Sign In</span>
                    </>
                  )}
                </button>
              </div>

              {/* Token / Callback URL Recovery Box for Supabase mobile scheme */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowTokenRecovery(!showTokenRecovery)}
                  className="text-[11px] text-sunset-muted hover:text-sunset-accent underline font-medium block mx-auto transition-colors"
                >
                  {showTokenRecovery ? 'Hide token recovery' : 'Got "io.supabase.traveler" popup? Click to paste token URL'}
                </button>

                {showTokenRecovery && (
                  <div className="mt-3 p-3.5 rounded-2xl glass-panel border border-sunset-border space-y-2.5 animate-fade-in">
                    <p className="text-[11px] text-sunset-muted leading-tight">
                      If Google completed authentication and gave a <code className="text-amber-400">io.supabase.traveler://...</code> URL, paste that URL here to complete login instantly:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste failed URL or access_token..."
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        className="flex-1 h-9 glass-input rounded-xl px-3 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleRecoverToken}
                        className="btn-accent px-3 py-1 text-xs font-bold whitespace-nowrap rounded-xl"
                      >
                        Authorize
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}



        </div>
      </div>

    </div>
  );
};
