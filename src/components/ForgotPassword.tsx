import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      console.error('Password reset error:', err);
      // Friendly messages for standard Firebase Auth errors
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-tea-green/10 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-tea-green/30"
      >
        <div className="mb-6">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-primary font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-violet-deep">Forgot Password?</h2>
          <p className="text-slate-500 mt-2">
            No worries! Enter your email address below and we'll send you a password reset link.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm mb-6 border border-emerald-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Reset Email Sent!</p>
              <p className="mt-1 text-emerald-600">Please check your inbox (and spam folder) for instructions to reset your password.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-primary/20 focus:border-violet-primary transition-all text-sm"
                placeholder="email@example.com"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-violet-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-violet-deep transition-colors shadow-lg shadow-violet-primary/20 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> 
            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Remember your password? {' '}
          <Link to="/login" className="text-violet-primary font-bold hover:underline">
            Log in here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
