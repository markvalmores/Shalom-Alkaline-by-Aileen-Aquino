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
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/community');
    } catch (err: any) {
      setError(err.message);
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
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm mb-6 border border-red-100">
            {error}
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
            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
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
