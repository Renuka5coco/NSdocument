import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FileText, Lock, Mail, User, Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react';

const API_BASE = import.meta.env.PROD
  ? "https://nsdocument.onrender.com"
  : "http://localhost:8000";

export default function AuthPage({ onAuth, isDark, onToggleTheme }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
      const res = await axios.post(`${API_BASE}${endpoint}`, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({ name: res.data.name, email: res.data.email }));
      onAuth(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabActive = 'bg-blue-500 text-white shadow-lg';
  const tabInactive = isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-800';
  const tabBg = isDark ? 'bg-white/5' : 'bg-slate-100';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}>

      {/* Theme toggle top-right */}
      <button
        onClick={onToggleTheme}
        className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center transition-all glass border"
        style={{ borderColor: 'var(--border)' }}
      >
        {isDark
          ? <Sun size={18} className="text-amber-400" />
          : <Moon size={18} className="text-blue-500" />}
      </button>

      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.07)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border"
            style={{ background: 'rgba(59,130,246,0.12)', borderColor: 'rgba(59,130,246,0.25)' }}>
            <FileText size={32} className="text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            AI Doc Intelligence
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Automated entity extraction & processing
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className={`flex ${tabBg} rounded-xl p-1 mb-8`}>
            {['login', 'register'].map(tab => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === tab ? tabActive : tabInactive
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: 'var(--text-muted)' }}>Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }} />
                    <input type="text" value={form.name} onChange={set('name')}
                      placeholder="John Doe" required={mode === 'register'}
                      className="w-full theme-input rounded-xl pl-10 pr-4 py-3 text-sm transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-muted)' }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input type="email" value={form.email} onChange={set('email')}
                  placeholder="you@example.com" required
                  className="w-full theme-input rounded-xl pl-10 pr-4 py-3 text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-muted)' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={set('password')} placeholder="••••••••" required minLength={6}
                  className="w-full theme-input rounded-xl pl-10 pr-12 py-3 text-sm transition-colors"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                {error}
              </motion.p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
