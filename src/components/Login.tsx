import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResetLink, setShowResetLink] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const navigate = useNavigate();

  const handleDirectReset = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return;
    setIsSendingReset(true);
    setResetSuccess('');
    setError('');
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, trimmedEmail);
      setResetSuccess(`Password reset email successfully sent to ${trimmedEmail}! Please check your inbox (and spam folders) to reset your password.`);
      setShowResetLink(false);
    } catch (err: any) {
      console.error('Direct reset error:', err);
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');
    setShowResetLink(false);
    const trimmedEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, cleanPassword);
      navigate('/community');
    } catch (err: any) {
      console.log('Login failed, checking auto-registration fallback...', err);
      
      // Auto-provisioning mechanism for designated admin accounts
      if (trimmedEmail === 'mdv4244@gmail.com' || trimmedEmail === 'aquinoaileen305@gmail.com') {
        try {
          const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
          const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
          const { db } = await import('../lib/firebase');

          const { user } = await createUserWithEmailAndPassword(auth, trimmedEmail, cleanPassword);
          const name = trimmedEmail === 'mdv4244@gmail.com' ? 'Mark Admin' : 'Aileen Admin';
          
          await updateProfile(user, { displayName: name });

          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: name,
            email: trimmedEmail,
            photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            coverURL: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2070',
            bio: 'Shalom Water Purifiers Administrator',
            followingCount: 0,
            followersCount: 0,
            isAdmin: true,
            createdAt: serverTimestamp()
          });

          // Redirect upon successful registration
          navigate('/community');
          return;
        } catch (regErr: any) {
          console.error('Auto-registration failed:', regErr);
          if (regErr.code === 'auth/email-already-in-use') {
            setError(`The admin account "${trimmedEmail}" is already registered on this Firebase project with a different password. Please verify your password, or trigger a reset link below.`);
            setShowResetLink(true);
          } else {
            setError(regErr.message || 'Error occurred. Please verify your internet connection.');
          }
          return;
        }
      }

      // Friendly message for non-admin accounts
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. If you do not have an account, please register first.');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-tea-green/10 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-tea-green/30"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-violet-deep">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Log in to your Shalom account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex flex-col gap-2">
            <p className="font-medium">{error}</p>
            {showResetLink && (
              <button
                type="button"
                onClick={handleDirectReset}
                disabled={isSendingReset}
                className="mt-1 text-xs font-bold text-violet-primary hover:text-violet-deep underline text-left cursor-pointer"
              >
                {isSendingReset ? 'Sending reset link...' : '👉 Click here to send password reset email instantly'}
              </button>
            )}
          </div>
        )}

        {resetSuccess && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm mb-6 border border-emerald-100 font-medium">
            {resetSuccess}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-primary/20 focus:border-violet-primary transition-all"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-violet-primary hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-primary/20 focus:border-violet-primary transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-violet-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-violet-deep transition-colors shadow-lg shadow-violet-primary/20"
          >
            <LogIn className="w-5 h-5" /> Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Don't have an account? {' '}
          <Link to="/register" className="text-violet-primary font-bold hover:underline">
            Register here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
