import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { KeyRound, Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to submit request. Please try again later.');
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
            <KeyRound className="w-5 h-5" />
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-app-main">
            Forgot Password
          </h1>
          <p className="text-xs sm:text-sm text-app-muted font-sans">
            Enter your registered administrator email address to receive a secure password reset link.
          </p>
        </div>

        {/* Success Confirmation */}
        {submitted ? (
          <div className="space-y-4 text-center animate-fade-in">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-left flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <p className="font-semibold">Reset Link Dispatched</p>
                <p>
                  If <strong>{email}</strong> is associated with the administrator account, a password reset link valid for <strong>30 minutes</strong> has been sent.
                </p>
              </div>
            </div>

            <p className="text-xs text-app-muted font-sans">
              Didn't receive the email? Check your spam folder or verify your email configuration.
            </p>

            <div className="pt-2">
              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary-main hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
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

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-xs font-semibold text-app-main uppercase tracking-wider mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-app-surface border border-app-border rounded-lg text-sm text-app-main focus:outline-none focus:border-primary-main focus-accessible transition-colors min-h-[44px]"
                  />
                  <Mail className="w-4 h-4 text-app-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-primary-main hover:bg-primary-hover text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 min-h-[44px] cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center border-t border-app-border">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-app-muted hover:text-app-main transition-colors py-2 min-h-[44px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Admin Sign In</span>
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
