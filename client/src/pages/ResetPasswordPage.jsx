import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ShieldCheck, Lock, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Real-time strength rules
  const hasMinLength = password.length >= 10;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isStrong = hasMinLength && hasLetter && hasNumber;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isStrong) {
      setError('Password must be at least 10 characters and contain both letters and numbers.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword(token, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/login', { replace: true });
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-16 px-1">
      <div className="card-soft p-6 sm:p-8 shadow-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary-light dark:bg-primary-light/40 border border-primary-main/20 text-primary-main mx-auto flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-app-main">
            Set New Password
          </h1>
          <p className="text-xs sm:text-sm text-app-muted font-sans">
            Choose a strong, unique password for your administrator account.
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center animate-fade-in">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-left flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <p className="font-semibold">Password Successfully Reset</p>
                <p>
                  Your administrator password has been updated. Old active sessions have been invalidated. Redirecting you to sign in...
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary-main hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Error Alert */}
            {error && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-800 dark:text-red-300 flex items-start gap-2.5 animate-fade-in" role="alert">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-xs font-semibold text-app-main uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 bg-app-surface border border-app-border rounded-lg text-sm text-app-main focus:outline-none focus:border-primary-main focus-accessible transition-colors min-h-[44px]"
                  />
                  <Lock className="w-4 h-4 text-app-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-app-muted hover:text-app-main transition-colors focus-accessible rounded"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-xs font-semibold text-app-main uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-app-surface border border-app-border rounded-lg text-sm text-app-main focus:outline-none focus:border-primary-main focus-accessible transition-colors min-h-[44px]"
                  />
                  <Lock className="w-4 h-4 text-app-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Password Requirements Helper Checklist */}
              <div className="p-3 bg-app-surface-hover rounded-lg border border-app-border text-[11px] space-y-1">
                <p className="font-semibold text-app-main mb-1">Security Requirements:</p>
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-app-muted'}`}>
                  <span>{hasMinLength ? '✓' : '•'}</span>
                  <span>Minimum 10 characters length</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLetter && hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-app-muted'}`}>
                  <span>{hasLetter && hasNumber ? '✓' : '•'}</span>
                  <span>Contains both letters and numbers</span>
                </div>
                {confirmPassword && (
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    <span>{passwordsMatch ? '✓' : '✗'}</span>
                    <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isStrong || !passwordsMatch}
                className="w-full py-3 px-4 bg-primary-main hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 min-h-[44px] cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Save New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center border-t border-app-border">
              <Link
                to="/admin/login"
                className="inline-block text-xs sm:text-sm text-app-muted hover:text-app-main transition-colors py-2 min-h-[44px]"
              >
                ← Back to Admin Sign In
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
