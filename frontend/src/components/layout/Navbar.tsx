import React, { useState, useEffect } from 'react';
import { Bell, Search, Settings, User as UserIcon, LogOut, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useAppMode } from '../../context/AppModeContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// switchDemoRole is imported only for the demo quick-switcher feature.
// In production builds, this import is tree-shaken away (DEMO_MODE is false,
// so the JSX branch referencing it is dead code).
import { switchDemoRole } from '../../services/auth/index';

interface NavbarProps {
  onOpenNotifications: () => void;
}

const ROLES = ['patient', 'doctor', 'hospital', 'admin'] as const;

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications }) => {
  const { role, currentUser, unreadCount } = useApp();
  const { logout } = useAuth();
  const { isDemoMode } = useAppMode();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-white/5 bg-[#05070c]/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar */}
      <div className="flex items-center w-96 relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3" />
        <input
          type="text"
          placeholder="Search clinical telemetry, reports, or patients..."
          className="w-full bg-white/5 border border-white/5 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10 placeholder:text-slate-500 transition-all"
        />
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-6">
        {/* Demo Mode Badge — shown only when isDemoMode is true */}
        {isDemoMode && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.15)] select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Demo Mode
          </div>
        )}

        {/* Real-time Clock */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider font-sans">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' })}
          </span>
          <span className="text-[10px] text-slate-500 font-sans mt-0.5">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Notifications Icon */}
        <button
          onClick={onOpenNotifications}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all relative border border-white/5"
        >
          <Bell className="w-4 h-4 text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-cyan-400 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-glow-cyan">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center font-bold text-black text-xs select-none">
                {currentUser.name ? currentUser.name.split(' ').map((n) => n[0]).join('') : 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-slate-200 leading-none">{currentUser.name}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-sans uppercase font-bold tracking-wider leading-none">
                  {role}
                </span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 leading-none">{currentUser.email}</p>
            </div>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-56 glass-panel border border-white/10 rounded-xl shadow-2xl p-1 z-20 bg-[#0b1120]/95 backdrop-blur-xl"
                >
                  {/* User Info Header */}
                  <div className="px-3 py-2 border-b border-white/5 mb-1 text-left">
                    <p className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</p>
                    <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider mt-0.5">{role} Portal</p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200 rounded-lg transition-all text-left"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200 rounded-lg transition-all text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => { setDropdownOpen(false); onOpenNotifications(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200 rounded-lg transition-all text-left"
                  >
                    <Bell className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Notifications</span>
                  </button>

                  <button
                    onClick={() => { setDropdownOpen(false); alert('Help Desk: Support team contacted. A ticket has been raised.'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200 rounded-lg transition-all text-left"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Help &amp; Support</span>
                  </button>

                  {/* Quick Role Switcher — visible in demo mode only (UI decision via context) */}
                  {isDemoMode && (
                    <>
                      <div className="border-t border-white/5 my-1" />
                      <div className="px-3 py-1.5 text-left">
                        <p className="text-[8px] text-slate-500 font-bold tracking-wider uppercase">Quick Switch Role</p>
                      </div>
                      {ROLES.map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            setDropdownOpen(false);
                            switchDemoRole(r);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] rounded-lg transition-all text-left ${
                            role === r
                              ? 'bg-amber-500/10 text-amber-400 font-semibold'
                              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                          }`}
                        >
                          <span className="capitalize">{r} Portal</span>
                        </button>
                      ))}
                    </>
                  )}

                  <div className="border-t border-white/5 mt-1 pt-1">
                    <button
                      onClick={() => { logout(); navigate('/login'); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
