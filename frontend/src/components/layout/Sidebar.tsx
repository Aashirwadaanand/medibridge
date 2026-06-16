import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Activity,
  AlertTriangle,
  Calendar,
  FileText,
  Briefcase,
  Layers,
  Shield,
  Stethoscope,
  ClipboardList,
  Building,
  LogOut,
  History
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { role, emergencyState } = useApp();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getMenuItems = () => {
    switch (role) {
      case 'patient':
        return [
          { id: 'patient-dashboard', label: 'Patient Dashboard', icon: <Activity className="w-4 h-4" /> },
          { id: 'health-timeline', label: 'Health Timeline', icon: <History className="w-4 h-4" /> },
          { id: 'symptom-checker', label: 'AI Symptom Checker', icon: <Heart className="w-4 h-4" /> },
          { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
          { id: 'health-vault', label: 'Health Vault', icon: <ClipboardList className="w-4 h-4" /> },
          { id: 'report-intel', label: 'Report Intelligence', icon: <FileText className="w-4 h-4" /> },
          { id: 'pharmacy-network', label: 'Pharmacy Network', icon: <Briefcase className="w-4 h-4" /> }
        ];
      case 'doctor':
        return [
          { id: 'doctor-dashboard', label: 'Doctor Dashboard', icon: <Stethoscope className="w-4 h-4" /> },
          { id: 'appointments', label: 'Patient Queue', icon: <Calendar className="w-4 h-4" /> },
          { id: 'report-intel', label: 'Report Analyzer', icon: <FileText className="w-4 h-4" /> }
        ];
      case 'hospital':
        return [
          { id: 'hospital-dashboard', label: 'Hospital Dashboard', icon: <Building className="w-4 h-4" /> },
          { id: 'appointments', label: 'Resource Queue', icon: <Calendar className="w-4 h-4" /> }
        ];
      case 'admin':
        return [
          { id: 'admin-dashboard', label: 'Admin Dashboard', icon: <Shield className="w-4 h-4" /> },
          { id: 'system-telemetry', label: 'System Telemetry', icon: <Layers className="w-4 h-4" /> }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 64 : 260 }}
      transition={{ type: 'spring', damping: 20, stiffness: 150 }}
      className="bg-[#0b1120]/80 border-r border-white/5 flex flex-col relative h-screen z-20 backdrop-blur-md"
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-black fill-black/10" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold tracking-wider text-sm bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent font-sans"
            >
              MEDIBRIDGE
            </motion.span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-white/5 text-slate-500 hover:text-slate-300 rounded-md transition-all hidden sm:block"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Emergency Command Center Portal */}
      <div className="p-3 border-b border-white/5">
        <button
          onClick={() => {
            if (window.location.pathname === '/profile' || window.location.pathname === '/settings') {
              navigate(`/${role}`);
              setTimeout(() => {
                setActivePage('emergency-center');
              }, 50);
            } else {
              setActivePage('emergency-center');
            }
          }}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all text-xs font-semibold ${
            activePage === 'emergency-center'
              ? 'bg-rose-500 text-white shadow-glow-rose'
              : emergencyState.sosActive
              ? 'bg-rose-600/30 text-rose-400 border border-rose-500/40 animate-pulse'
              : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
          }`}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse" />
          {!isCollapsed && <span>Emergency Center</span>}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (window.location.pathname === '/profile' || window.location.pathname === '/settings') {
                  navigate(`/${role}`);
                  setTimeout(() => {
                    setActivePage(item.id);
                  }, 50);
                } else {
                  setActivePage(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white/5 text-cyan-400 font-semibold border-l-2 border-cyan-400'
                  : 'text-slate-400 hover:bg-white/[0.02] hover:text-slate-200'
              }`}
            >
              <div className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</div>
              {!isCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Footer Area */}
      <div className="p-4 border-t border-white/5 text-center text-[10px] text-slate-600 font-mono">
        {!isCollapsed && <span>v1.0.0-PRO</span>}
      </div>
    </motion.aside>
  );
};
export default Sidebar;
