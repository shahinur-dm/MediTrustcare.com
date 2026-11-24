import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@meditrust.com');
  const [password, setPassword] = useState('admin123Password!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-950 to-slate-900 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header with Official Logo */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-950 p-6 sm:p-8 text-white text-center relative">
          <div className="flex justify-center mb-3">
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl shadow-black/30 border border-slate-100 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="MediTrust Care Bangladesh"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">MediTrust Care Bangladesh</h1>
          <p className="text-xs text-brand-300 font-medium tracking-wide uppercase mt-1">
            Enterprise Distribution & Healthcare ERP
          </p>
          <div className="absolute top-4 right-4">
            <span className="flex items-center gap-1 text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full">
              <Activity className="w-3 h-3 animate-pulse text-emerald-400" /> Live
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@meditrust.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                <span>Keep session active</span>
              </label>
              <span className="text-[11px] text-slate-400">Faridpur Hub & Dhaka</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to ERP Portal'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 bg-slate-50 p-3 rounded-lg">
            <p className="font-semibold text-slate-700">Quick Access Credentials:</p>
            <div className="flex flex-col sm:flex-row sm:justify-between text-[10px] sm:text-[11px]">
              <span className="font-medium text-slate-600">Super Admin:</span>
              <code className="text-slate-800 font-mono">admin@meditrust.com / admin123Password!</code>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between text-[10px] sm:text-[11px]">
              <span className="font-medium text-slate-600">Sales Manager:</span>
              <code className="text-slate-800 font-mono">sales@meditrust.com / password123</code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 sm:px-8 py-3 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400">
            Official Platform: <a href="https://www.meditrustcarebd.com/" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">meditrustcarebd.com</a> • Faridpur, Bangladesh
          </p>
        </div>
      </div>
    </div>
  );
};
