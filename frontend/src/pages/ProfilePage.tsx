import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, Calendar, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProfilePage: React.FC = () => {
  const { user, updateProfileName } = useAuth();
  
  // Custom profile state persisted in localStorage
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('unspecified');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id || 'default';

  // Load custom profile details on mount
  useEffect(() => {
    if (user) {
      setName(user.name);
      const savedProfile = localStorage.getItem(`medibridge_profile_${user.id}`);
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setPhone(parsed.phone || '');
          setGender(parsed.gender || 'unspecified');
          setDob(parsed.dob || '');
          setAddress(parsed.address || '');
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      // 1. Update name in AuthContext and localStorage user details
      if (name.trim()) {
        await updateProfileName(name.trim());
      } else {
        throw new Error('Name cannot be empty.');
      }

      // 2. Persist other custom fields in localStorage
      const profileData = {
        phone,
        gender,
        dob,
        address
      };
      localStorage.setItem(`medibridge_profile_${userId}`, JSON.stringify(profileData));

      setSuccess(true);
      // Auto dismiss success toast after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile details.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Generate formatting values
  const dateJoined = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'June 16, 2026';

  const lastLoginStr = localStorage.getItem(`medibridge_last_login_${user.id}`);
  const lastLogin = lastLoginStr 
    ? new Date(lastLoginStr).toLocaleString()
    : new Date().toLocaleString();

  const getRoleStyle = (roleName: string) => {
    switch (roleName) {
      case 'patient':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'doctor':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'hospital':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'admin':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans">Account Profile</h2>
          <p className="text-xs text-slate-400 mt-1">Manage your identity, personal records, and clinical metadata.</p>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-400"
          >
            <Check className="w-4 h-4" />
            <span>Profile changes saved successfully!</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center gap-2.5 text-xs text-red-400"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-4 h-fit">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center font-bold text-black text-2xl shadow-glow-cyan">
              {name.split(' ').map(n => n[0]).join('')}
            </div>
            {/* Online Indicator */}
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#05070c] rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-ping" />
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100">{name}</h3>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>

          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getRoleStyle(user.role)}`}>
            {user.role}
          </span>

          <div className="w-full border-t border-white/5 pt-4 space-y-2 text-left text-[11px] text-slate-500">
            <div className="flex justify-between">
              <span>Account Status</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
              </span>
            </div>
            <div className="flex justify-between">
              <span>Joined Platform</span>
              <span className="text-slate-300">{dateJoined}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Login</span>
              <span className="text-slate-300 truncate max-w-[140px]" title={lastLogin}>{lastLogin}</span>
            </div>
          </div>
        </div>

        {/* Edit Fields Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-white/5 pb-2">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
              <div className="relative flex items-center">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input pl-10 py-2 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
              <div className="relative flex items-center">
                <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full glass-input pl-10 py-2 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full glass-input py-2 text-xs bg-[#0b1120]"
              >
                <option value="unspecified">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Date of Birth</label>
              <div className="relative flex items-center">
                <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3.5" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full glass-input pl-10 py-2 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Residential Address</label>
            <div className="relative flex items-center">
              <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3.5" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="456 Outer Circle, Connaught Place, New Delhi"
                className="w-full glass-input pl-10 py-2 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glass-btn-primary px-6 py-2.5 text-xs font-semibold w-fit ml-auto mt-4"
          >
            {loading ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
