import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, User as UserIcon, Mail, Lock, Shield, Stethoscope, Building, ArrowRight, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';
import { motion } from 'framer-motion';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score, label: 'Very Weak', color: 'bg-red-500/20', width: '0%' };
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { score, label: 'Weak', color: 'bg-red-500', width: '25%' };
      case 2:
        return { score, label: 'Fair', color: 'bg-orange-500', width: '50%' };
      case 3:
        return { score, label: 'Good', color: 'bg-amber-400', width: '75%' };
      case 4:
        return { score, label: 'Strong', color: 'bg-emerald-400', width: '100%' };
      default:
        return { score: 0, label: 'Weak', color: 'bg-red-500', width: '25%' };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate Passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const user = await register(name, email, password, role);
      navigate(`/${user.role}`);
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const rolesList: { value: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
    { value: 'patient', label: 'Patient', description: 'Access records & triage', icon: <Activity className="w-5 h-5" /> },
    { value: 'doctor', label: 'Doctor', description: 'Manage clinic queue', icon: <Stethoscope className="w-5 h-5" /> },
    { value: 'hospital', label: 'Hospital', description: 'Monitor beds & tools', icon: <Building className="w-5 h-5" /> },
    { value: 'admin', label: 'Admin', description: 'System setup & ops', icon: <Shield className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070c] relative overflow-hidden px-4 py-8">
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
            <h2 className="text-xl font-bold text-slate-100">Create Workspace</h2>
            <p className="text-xs text-slate-400">Register a new secure account on the platform.</p>
          </div>

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
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-4" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full glass-input pl-11 py-3 text-xs"
                  required
                />
              </div>
            </div>

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

              {/* Password Strength Indicator */}
              {password && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1 pt-1"
                >
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Password Strength</span>
                    <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strength.color} transition-all duration-300`} 
                      style={{ width: strength.width }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-4" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input pl-11 pr-10 py-3 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1.5 absolute right-3 text-slate-500 hover:text-slate-300 transition-all"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Interactive Role Cards Selection */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Workspace Role</label>
              <div className="grid grid-cols-2 gap-3">
                {rolesList.map((item) => {
                  const isSelected = role === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setRole(item.value)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                        isSelected
                          ? 'bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 border-cyan-400/50 shadow-glow-cyan'
                          : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className={`p-2 rounded-xl w-fit ${isSelected ? 'bg-cyan-400 text-black shadow-glow-cyan' : 'bg-white/5 text-slate-400'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-cyan-400 font-extrabold' : 'text-slate-200'}`}>{item.label}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5 leading-snug">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-btn-primary w-full py-3 mt-4 text-xs font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Registering...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account <ArrowRight className="w-3.5 h-3.5 text-black" />
                </span>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-all">
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
