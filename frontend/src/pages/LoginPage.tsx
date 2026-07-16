import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, ArrowRight, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { DEMO_MODE } from '../config/appMode';

export const LoginPage: React.FC = () => {
  const { login, sessionExpired, setSessionExpired } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize fields based on Remember Me settings
  useEffect(() => {
    const savedEmail = localStorage.getItem('medibridge_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);

      // Save/remove email for Remember Me
      if (rememberMe) {
        localStorage.setItem('medibridge_remember_email', email);
      } else {
        localStorage.removeItem('medibridge_remember_email');
      }

      setSessionExpired(false);
      // Route user to the appropriate page depending on role
      navigate(`/${user.role}`);
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070c] relative overflow-hidden px-4">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="p-3 bg-gradient-to-r from-cyan-400/10 to-emerald-400/10 border border-cyan-500/20 rounded-2xl text-cyan-400 shadow-glow-cyan animate-glow-cyan"
          >
            <Activity className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent font-sans">
            MEDIBRIDGE
          </h1>
          <p className="text-xs text-slate-400">
            Unified Clinical Telemetry & Health Vault
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100">Welcome Back</h2>
            <p className="text-xs text-slate-400">Sign in to access your secure clinical workspace.</p>
          </div>

          {sessionExpired && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-400"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Session Expired</p>
                <p className="mt-0.5 text-[10px] text-amber-400/70">Your security token has expired. Please log in again to continue.</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-500 absolute left-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@medibridge.io"
                  className="w-full glass-input pl-11 py-3 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input pl-11 pr-10 py-3 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 absolute right-3 text-slate-500 hover:text-slate-300 transition-all"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 bg-slate-850 text-cyan-500 focus:ring-0 focus:ring-offset-0 transition-all w-3.5 h-3.5"
                />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Remember Me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-btn-primary w-full py-3 mt-4 text-xs font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="w-3.5 h-3.5 text-black" />
                </span>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Don't have a workspace account?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-all">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {DEMO_MODE && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 rounded-3xl border border-white/5 space-y-4"
          >
            <div className="border-b border-white/5 pb-2 text-left">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Demo Accounts Quick Login</h3>
              <p className="text-[9px] text-slate-500 mt-0.5">Click any role to autofill credentials and log in instantly.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left">
              {[
                { role: 'Patient (Priya)', email: 'priya@medibridge.com', pass: 'priya123' },
                { role: 'Patient (Anshuman)', email: 'patient@medibridge.com', pass: 'patient123' },
                { role: 'ASHA / CHW', email: 'chw@medibridge.com', pass: 'chw123' },
                { role: 'Doctor', email: 'doctor@medibridge.com', pass: 'doctor123' },
                { role: 'Hospital', email: 'hospital@medibridge.com', pass: 'hospital123' },
                { role: 'Admin', email: 'admin@medibridge.com', pass: 'admin123' }
              ].map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.pass);
                  }}
                  className="p-2 bg-white/[0.02] border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/20 rounded-xl transition-all"
                >
                  <span className="text-[10px] font-bold text-slate-200 block">{acc.role}</span>
                  <span className="text-[9px] text-slate-500 block truncate font-mono">{acc.email}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;
