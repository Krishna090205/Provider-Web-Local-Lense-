import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Compass, Mail, Lock, User, Briefcase, ArrowRight,
  CheckCircle2, AlertCircle, Building2
} from 'lucide-react';
import { useAuth } from '../features/auth';
import {
  loginSchema, LoginFormValues,
  registerSchema, RegisterFormValues,
  forgotPasswordSchema, ForgotPasswordFormValues
} from '../features/auth/authSchema';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const initialRole = searchParams.get('role') === 'provider' ? 'provider' : 'tourist';

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

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

  const selectedRole = registerForm.watch('role');

  const onLoginSubmit = async (data: LoginFormValues) => {
    setStatusMessage(null);
    try {
      const res = await signIn(data.email, data.password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Invalid email or password.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setStatusMessage({ type: 'error', text: msg });
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setStatusMessage(null);
    try {
      const res = await signUp(data.email, data.password, data.name, data.role, data.businessName);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: data.role === 'provider'
            ? 'Provider registration submitted! Your account is pending verification by our admin team.'
            : 'Welcome to LocalLens! Account created successfully.',
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Registration failed.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setStatusMessage({ type: 'error', text: msg });
    }
  };

  const onForgotSubmit = async (data: ForgotPasswordFormValues) => {
    setStatusMessage(null);
    try {
      const res = await resetPassword(data.email);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Password reset instructions dispatched to your email.' });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to dispatch reset email.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setStatusMessage({ type: 'error', text: msg });
    }
  };

  // Quick 1-click test logins
  const handleQuickLogin = async (presetEmail: string) => {
    loginForm.setValue('email', presetEmail);
    loginForm.setValue('password', 'demoPass123!');
    const res = await signIn(presetEmail, 'demoPass123!');
    if (res.success) {
      navigate('/dashboard');
    }
  };

  const isSubmitting = loginForm.formState.isSubmitting || registerForm.formState.isSubmitting || forgotForm.formState.isSubmitting;

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
              onClick={() => { setMode('login'); setStatusMessage(null); }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === 'login' ? 'btn-accent shadow-md' : 'text-sunset-muted hover:text-sunset-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setStatusMessage(null); }}
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
              
              {/* Role Selection: Tourist vs Provider only */}
              <div className="space-y-2 mb-4">
                <label className="text-xs font-bold text-sunset-accent uppercase tracking-wider block font-serif">
                  Select Your Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => registerForm.setValue('role', 'tourist')}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      selectedRole === 'tourist'
                        ? 'bg-sunset-accent/15 border-sunset-accent shadow-lg shadow-sunset-accent/10'
                        : 'bg-sunset-bg/60 border-sunset-border hover:border-sunset-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-sunset-accent/20 flex items-center justify-center text-sunset-accent">
                        <User className="w-4 h-4" />
                      </div>
                      {selectedRole === 'tourist' && <div className="w-2.5 h-2.5 rounded-full bg-sunset-accent" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-sunset-text">Tourist / Explorer</p>
                      <p className="text-[11px] text-sunset-muted leading-tight mt-0.5">
                        Discover & bookmark places, write authentic reviews
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => registerForm.setValue('role', 'provider')}
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
                        Submit business for review, publish verified listings
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

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-8 pt-6 border-t border-sunset-border">
            <p className="text-xs text-sunset-muted font-semibold text-center mb-3">
              Quick Test Profiles (Click to log in instantly):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('tourist.explorer@gmail.com')}
                className="p-2 rounded-xl bg-sunset-bg border border-sunset-border hover:border-sunset-accent text-[11px] font-semibold text-sunset-text text-center transition-colors"
              >
                <span className="block text-sunset-accent">Tourist</span>
                <span className="text-[10px] text-sunset-muted">Explorer</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('priya@malabarstays.in')}
                className="p-2 rounded-xl bg-sunset-bg border border-sunset-border hover:border-emerald-500 text-[11px] font-semibold text-sunset-text text-center transition-colors"
              >
                <span className="block text-emerald-400">Provider</span>
                <span className="text-[10px] text-sunset-muted">Approved</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rajesh.kulkarni@mumbaicafe.in')}
                className="p-2 rounded-xl bg-sunset-bg border border-sunset-border hover:border-amber-500 text-[11px] font-semibold text-sunset-text text-center transition-colors"
              >
                <span className="block text-amber-400">Provider</span>
                <span className="text-[10px] text-sunset-muted">Pending</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin.locallens@mumbai.gov.in')}
                className="p-2 rounded-xl bg-sunset-bg border border-sunset-border hover:border-sunset-accent text-[11px] font-semibold text-sunset-text text-center transition-colors"
              >
                <span className="block text-sunset-accent-hot">Admin</span>
                <span className="text-[10px] text-sunset-muted">Reviewer</span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
