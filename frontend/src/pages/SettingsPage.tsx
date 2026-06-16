import React, { useState } from 'react';
import { Settings, Shield, Bell, Eye, EyeOff, Check, AlertCircle, Laptop, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppMode } from '../context/AppModeContext';
import { resetDemoData, seedDemoDatabase, clearDemoNotifications, restoreFactoryDefaults } from '../services/mockData';

export const SettingsPage: React.FC = () => {
  const { mode, setMode } = useAppMode();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'security' | 'notifications'>('general');

  // General Settings
  const [language, setLanguage] = useState('en');
  
  // Appearance Settings
  const [darkMode, setDarkMode] = useState(true);

  // Security (Change Password)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Notifications Settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [emailNews, setEmailNews] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [pushSounds, setPushSounds] = useState(true);

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { label: 'Very Weak', color: 'bg-red-500/20', width: '0%' };
    if (pass.length >= 6) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { label: 'Weak', color: 'bg-red-500', width: '25%' };
      case 2:
        return { label: 'Fair', color: 'bg-orange-500', width: '50%' };
      case 3:
        return { label: 'Good', color: 'bg-amber-400', width: '75%' };
      case 4:
        return { label: 'Strong', color: 'bg-emerald-400', width: '100%' };
      default:
        return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    }
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(false);

    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }

    setSecurityLoading(true);

    // Simulate API request
    setTimeout(() => {
      setSecurityLoading(false);
      setSecuritySuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-sans">Workspace Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Configure layout preferences, security controls, and notification triggers.</p>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-400"
          >
            <Check className="w-4 h-4 animate-pulse" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="md:col-span-1 glass-card p-4 rounded-2xl border border-white/5 space-y-1.5 h-fit">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-3 py-2.5 text-xs rounded-xl transition-all flex items-center gap-2.5 font-medium ${
              activeTab === 'general' ? 'bg-white/5 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-white/[0.01]'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>General</span>
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full text-left px-3 py-2.5 text-xs rounded-xl transition-all flex items-center gap-2.5 font-medium ${
              activeTab === 'appearance' ? 'bg-white/5 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-white/[0.01]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Appearance</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-3 py-2.5 text-xs rounded-xl transition-all flex items-center gap-2.5 font-medium ${
              activeTab === 'security' ? 'bg-white/5 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-white/[0.01]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-3 py-2.5 text-xs rounded-xl transition-all flex items-center gap-2.5 font-medium ${
              activeTab === 'notifications' ? 'bg-white/5 text-cyan-400 font-semibold' : 'text-slate-400 hover:bg-white/[0.01]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="glass-card p-6 rounded-2xl border border-white/5 space-y-6"
              >
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">General Options</h3>
                </div>

                {/* Language Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Default Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full glass-input py-2.5 text-xs bg-[#0b1120] max-w-xs block"
                  >
                    <option value="en">English (US / UK)</option>
                    <option value="hi">Hindi (India)</option>
                    <option value="es">Spanish (Spain)</option>
                  </select>
                </div>

                {/* App Mode Switcher */}
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Application Telemetry Mode</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setMode('demo');
                        setSuccessMessage('Switched to Demo Presentation Mode.');
                        setTimeout(() => setSuccessMessage(null), 3000);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        mode === 'demo'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                          : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'
                      }`}
                    >
                      Demo Presentation Mode
                    </button>
                    <button
                      onClick={() => {
                        setMode('live');
                        setSuccessMessage('Switched to Live Backend API Mode.');
                        setTimeout(() => setSuccessMessage(null), 3000);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        mode === 'live'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                          : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10'
                      }`}
                    >
                      Live Backend API Mode
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Demo Mode uses rich local storage telemetry. Live Mode connects to MongoDB and Express services.
                  </p>
                </div>

                {/* Session Management */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">Active Web Sessions</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Manage and inspect signed-in browser terminals.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-400/10 text-cyan-400 rounded-lg">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Chrome on Windows (Current Session)</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">New Delhi, India • Active Now</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded">Current</span>
                  </div>
                </div>

                {/* Demo Mode Data Operations */}
                {mode === 'demo' && (
                  <div className="space-y-3 pt-6 border-t border-white/5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300">Demo Telemetry Controls</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Manage mock collections and notifications stored in your browser.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          resetDemoData();
                          setSuccessMessage('Demo telemetry data has been reset to defaults.');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }}
                        className="flex items-center justify-center px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-xs rounded-xl font-semibold transition-all"
                      >
                        Reset Demo Data
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          seedDemoDatabase();
                          setSuccessMessage('Generated additional telemetry cases successfully.');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }}
                        className="flex items-center justify-center px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs rounded-xl font-semibold transition-all"
                      >
                        Seed Demo Database
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          clearDemoNotifications();
                          setSuccessMessage('Demo notification panel cleared.');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }}
                        className="flex items-center justify-center px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-semibold transition-all"
                      >
                        Clear Notifications
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          restoreFactoryDefaults();
                          setSuccessMessage('Factory data successfully restored.');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }}
                        className="flex items-center justify-center px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs rounded-xl font-semibold transition-all"
                      >
                        Restore Factory Data
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="glass-card p-6 rounded-2xl border border-white/5 space-y-6"
              >
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Appearance & Theme</h3>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.01] border border-white/5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Dark Mode Accent Background</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Maintain HSL tailwind styles and glow effects.</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                      className="rounded border-white/10 bg-slate-850 text-cyan-500 focus:ring-0 focus:ring-offset-0 transition-all w-4 h-4"
                    />
                  </label>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="glass-card p-6 rounded-2xl border border-white/5 space-y-4"
              >
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Update Password</h3>
                </div>

                {securitySuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-400"
                  >
                    <Check className="w-4 h-4 animate-bounce" />
                    <span>Password updated successfully!</span>
                  </motion.div>
                )}

                {securityError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center gap-2.5 text-xs text-red-400"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{securityError}</span>
                  </motion.div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Current Password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full glass-input pr-10 py-2 text-xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 p-1.5 text-slate-500 hover:text-slate-300 transition-all"
                      >
                        {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">New Password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full glass-input pr-10 py-2 text-xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 p-1.5 text-slate-500 hover:text-slate-300 transition-all"
                      >
                        {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                          <span>Strength</span>
                          <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span>
                        </div>
                        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${strength.color} transition-all duration-300`}
                            style={{ width: strength.width }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Confirm New Password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full glass-input pr-10 py-2 text-xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 p-1.5 text-slate-500 hover:text-slate-300 transition-all"
                      >
                        {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={securityLoading}
                    className="glass-btn-primary w-fit ml-auto mt-4 px-6 py-2.5 text-xs font-semibold"
                  >
                    {securityLoading ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating...
                      </span>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="glass-card p-6 rounded-2xl border border-white/5 space-y-6"
              >
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Notification Preferences</h3>
                </div>

                <div className="space-y-4">
                  {/* Email Preferences */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Channels</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={emailAlerts}
                          onChange={(e) => setEmailAlerts(e.target.checked)}
                          className="rounded border-white/10 bg-slate-850 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-200">Critical Medical Alerts</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">Receive immediate diagnostic triggers or high risk vitals notifications.</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={emailNews}
                          onChange={(e) => setEmailNews(e.target.checked)}
                          className="rounded border-white/10 bg-slate-850 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-200">Weekly Wellness Summary</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">Get a comprehensive clinical report analyzer review emails.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Push Preferences */}
                  <div className="space-y-2.5 pt-4 border-t border-white/5">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Push Delivery</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={pushEnabled}
                          onChange={(e) => setPushEnabled(e.target.checked)}
                          className="rounded border-white/10 bg-slate-850 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-200">Enable In-App Banners</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">Show notifications when prescription edits or queue updates trigger.</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={pushSounds}
                          onChange={(e) => setPushSounds(e.target.checked)}
                          className="rounded border-white/10 bg-slate-850 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-200">Alert Sound Playback</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">Play dynamic acoustic indicators on incoming emergency actions.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
