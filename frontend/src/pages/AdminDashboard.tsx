import React, { useState, useEffect } from 'react';
import { 
  Users, Server, Database, Terminal, Shield, RefreshCw, Send, 
  AlertTriangle, Trash2, CheckCircle, Search, UserCheck, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  BarChart, Bar, LineChart, Line, AreaChart, Area
} from 'recharts';
import { useAppMode } from '../context/AppModeContext';
import adminService from '../services/adminService';
import { User, UserRole } from '../types';
import { MetricCard } from '../components/cards/MetricCard';
import { CardSkeleton, SuccessState } from '../components/common/Loader';

// Mock charts data
const mockCpuTelemetry = [
  { time: '12:00', cpu: 34 },
  { time: '12:15', cpu: 45 },
  { time: '12:30', cpu: 28 },
  { time: '12:45', cpu: 52 },
  { time: '13:00', cpu: 67 },
  { time: '13:15', cpu: 50 },
  { time: '13:30', cpu: 41 }
];

const mockMemoryTelemetry = [
  { time: '12:00', usage: 60 },
  { time: '12:15', usage: 61 },
  { time: '12:30', usage: 60 },
  { time: '12:45', usage: 62 },
  { time: '13:00', usage: 64 },
  { time: '13:15', usage: 63 },
  { time: '13:30', usage: 61 }
];

const mockSignupGrowth = [
  { day: 'Mon', patients: 12, clinicians: 2 },
  { day: 'Tue', patients: 19, clinicians: 3 },
  { day: 'Wed', patients: 15, clinicians: 1 },
  { day: 'Thu', patients: 22, clinicians: 4 },
  { day: 'Fri', patients: 30, clinicians: 5 },
  { day: 'Sat', patients: 10, clinicians: 0 },
  { day: 'Sun', patients: 8, clinicians: 1 }
];

const mockSystemLoad = [
  { name: '12:00', requests: 450 },
  { name: '12:15', requests: 520 },
  { name: '12:30', requests: 490 },
  { name: '12:45', requests: 680 },
  { name: '13:00', requests: 720 },
  { name: '13:15', requests: 610 },
  { name: '13:30', requests: 580 }
];

export const AdminDashboard: React.FC = () => {
  const { mode } = useAppMode();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'broadcast' | 'analytics'>('overview');
  
  // Stats & User State
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Broadcast Notification State
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcType, setBcType] = useState<string>('general');
  const [bcTarget, setBcTarget] = useState<string>('all');
  const [bcSending, setBcSending] = useState(false);

  // System Events Logs state
  const [logs, setLogs] = useState([
    { id: 1, time: '12:32:11', type: 'AUTH', text: 'JWT validated successfully for admin user_adm_01' },
    { id: 2, time: '12:30:05', type: 'DB', text: 'Database collections stats query completed in 8ms' },
    { id: 3, time: '12:28:44', type: 'SYS', text: 'Telemetry server monitor logs successfully synchronised' }
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const fetchedStats = await adminService.getStats();
      setStats(fetchedStats);
      
      const parsedStatus = statusFilter === 'all' ? undefined : statusFilter === 'active';
      const fetchedUsers = await adminService.getUsers(
        search || undefined,
        roleFilter || undefined,
        parsedStatus
      );
      setUsers(fetchedUsers);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to query system administration details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const fetchedStats = await adminService.getStats();
      setStats(fetchedStats);
      
      const parsedStatus = statusFilter === 'all' ? undefined : statusFilter === 'active';
      const fetchedUsers = await adminService.getUsers(
        search || undefined,
        roleFilter || undefined,
        parsedStatus
      );
      setUsers(fetchedUsers);
      
      setLogs(prev => [
        { 
          id: Date.now(), 
          time: new Date().toTimeString().split(' ')[0], 
          type: 'SYS', 
          text: 'Telemetry dashboard force synchronised.' 
        },
        ...prev
      ]);
      setSuccessMsg('System metrics refreshed.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Force telemetry refresh failure.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter, mode]);

  useEffect(() => {
    const handleDemoRefresh = () => {
      loadData();
    };
    window.addEventListener('medibridge-demo-refresh', handleDemoRefresh);
    return () => {
      window.removeEventListener('medibridge-demo-refresh', handleDemoRefresh);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const updatedUser = await adminService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updatedUser.role } : u));
      setSuccessMsg(`User role successfully changed to '${newRole}'.`);
      setLogs(prev => [
        { 
          id: Date.now(), 
          time: new Date().toTimeString().split(' ')[0], 
          type: 'AUTH', 
          text: `Role promoted/altered for user ${userId} to: ${newRole}` 
        },
        ...prev
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to alter user role.');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const targetStatus = !currentStatus;
      const updatedUser = await adminService.updateUserStatus(userId, targetStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: updatedUser.isActive } : u));
      setSuccessMsg(targetStatus ? 'User account activated.' : 'User account suspended.');
      setLogs(prev => [
        { 
          id: Date.now(), 
          time: new Date().toTimeString().split(' ')[0], 
          type: 'SYS', 
          text: `User ${userId} active state toggled to: ${targetStatus}` 
        },
        ...prev
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to toggle account active status.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user registry record? This action is irreversible.')) {
      return;
    }
    try {
      await adminService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setSuccessMsg('User registry account deleted successfully.');
      setLogs(prev => [
        { 
          id: Date.now(), 
          time: new Date().toTimeString().split(' ')[0], 
          type: 'DB', 
          text: `Permanently deleted user registry record for user ${userId}` 
        },
        ...prev
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to delete user record.');
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle || !bcMessage) return;
    try {
      setBcSending(true);
      const res = await adminService.broadcastNotification(bcTitle, bcMessage, bcType, bcTarget);
      setSuccessMsg(`Broadcast notification successfully dispatched to ${res?.sentCount || 0} active users.`);
      setBcTitle('');
      setBcMessage('');
      setLogs(prev => [
        { 
          id: Date.now(), 
          time: new Date().toTimeString().split(' ')[0], 
          type: 'NOTIF', 
          text: `System broadcast dispatched targeting '${bcTarget}' roles: "${bcTitle}"` 
        },
        ...prev
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to dispatch system broadcast.');
    } finally {
      setBcSending(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-slate-850 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {successMsg && (
        <SuccessState message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-between text-xs">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse" />
            {errorMsg}
          </span>
          <button onClick={() => setErrorMsg(null)} className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300">Dismiss</button>
        </div>
      )}

      {/* Header administration controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" /> System Administration Command
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Auditing gateway response times, user accounts registration databases, active sessions, and broadcasting notifications.
            {mode === 'demo' && (
              <span className="ml-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase font-mono">DEMO DATABASE MODE</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="glass-btn-secondary py-1.5 px-3.5 text-xs flex items-center gap-1.5 text-slate-300 border border-white/5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Telemetry'}
          </button>

          <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-white/5 font-bold text-[10px]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#1e293b] text-cyan-400 border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'users'
                  ? 'bg-[#1e293b] text-emerald-400 border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              User Registry
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'broadcast'
                  ? 'bg-[#1e293b] text-purple-400 border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Broadcast Console
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[#1e293b] text-rose-400 border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <>
          {/* Main Operational Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <MetricCard
              title="Active User Accounts"
              value={stats.users?.total || 0}
              subtext={`Admins: ${stats.users?.roles?.admin || 0} • Patients: ${stats.users?.roles?.patient || 0}`}
              icon={<Users className="w-4.5 h-4.5" />}
              accentColor="cyan"
            />
            <MetricCard
              title="Telemetry Sessions"
              value={`${stats.system?.activeSessions || 0} active`}
              subtext="Secure web connections"
              icon={<Activity className="w-4.5 h-4.5" />}
              accentColor="emerald"
            />
            <MetricCard
              title="Gateway Connection"
              value={stats.db?.status || 'Offline'}
              subtext="Mongoose client pool online"
              icon={<Database className="w-4.5 h-4.5" />}
              accentColor="rose"
            />
            <MetricCard
              title="Server CPU Load"
              value={`${Math.round((stats.system?.cpuLoad?.[0] || 0.5) * 100)}%`}
              subtext={`System Uptime: ${Math.round((stats.system?.uptime || 0) / 3600)} hrs`}
              icon={<Server className="w-4.5 h-4.5" />}
              accentColor="slate"
            />
          </div>

          <AnimatePresence mode="wait">
            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* System Load Chart */}
                <div className="lg:col-span-2 glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-80">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Vite API Gateway Request Volume</h4>
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">HEALTHY</span>
                  </div>
                  <div className="flex-1 w-full text-xs min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockSystemLoad}>
                        <defs>
                          <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                        <YAxis stroke="rgba(255,255,255,0.3)" />
                        <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Area type="monotone" dataKey="requests" name="HTTP Requests" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Operations Terminal Logs */}
                <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-80 overflow-hidden">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-cyan-400" /> Operational Events
                    </h3>
                    <button 
                      onClick={() => setLogs([])} 
                      className="text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase transition-all"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[9px] leading-relaxed mt-4 scrollbar-thin scrollbar-thumb-slate-800">
                    {logs.length > 0 ? (
                      logs.map((log, i) => (
                        <div key={log.id || i} className="p-2 rounded-lg bg-black/40 border border-white/5 text-slate-400 space-y-1">
                          <div className="flex justify-between text-slate-500 font-bold">
                            <span>[{log.type}]</span>
                            <span>{log.time}</span>
                          </div>
                          <p className="text-slate-300 leading-normal">{log.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-600 text-center py-12">Logs cleared.</p>
                    )}
                  </div>
                </div>

                {/* Database Statistics */}
                <div className="lg:col-span-3 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-white/5 pb-2">Mongoose Database Collection Audits</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {stats.db?.collections && Object.entries(stats.db.collections).map(([name, val]: any, i: number) => (
                      <div key={i} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-center space-y-1">
                        <span className="text-[9px] text-slate-500 font-semibold block uppercase tracking-wider truncate">{name}</span>
                        <span className="text-lg font-bold text-slate-200 font-mono">{val}</span>
                        <span className="text-[8px] text-slate-600 block">documents</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* User & Role Directory Tab Content */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="glass-card p-6 rounded-2xl border border-white/5 space-y-6"
              >
                {/* Search & Filters */}
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search accounts by name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full glass-input text-xs pl-10"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="space-y-0.5">
                      <select 
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="glass-input text-xs py-2 px-3"
                      >
                        <option value="">All Roles</option>
                        <option value="patient">Patients</option>
                        <option value="doctor">Doctors</option>
                        <option value="hospital">Hospitals</option>
                        <option value="pharmacy">Pharmacy</option>
                        <option value="admin">Administrators</option>
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="glass-input text-xs py-2 px-3"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active Accounts</option>
                        <option value="suspended">Suspended Accounts</option>
                      </select>
                    </div>

                    <button type="submit" className="glass-btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-black" /> Filter
                    </button>
                  </div>
                </form>

                {/* User Directory Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-500 uppercase text-[9px] font-bold tracking-wider">
                        <th className="py-3 px-4">User Details</th>
                        <th className="py-3 px-4">System Role</th>
                        <th className="py-3 px-4">Registration Date</th>
                        <th className="py-3 px-4">Active State</th>
                        <th className="py-3 px-4 text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {users.length > 0 ? (
                        users.map((user) => {
                          const userCreated = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
                          return (
                            <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                              {/* Details */}
                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-200 block">{user.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono block">{user.email}</span>
                                </div>
                              </td>

                              {/* Role */}
                              <td className="py-3 px-4">
                                <select
                                  value={user.role}
                                  onChange={(e) => handleChangeRole(user.id, e.target.value as UserRole)}
                                  className="bg-[#0b1120]/80 border border-white/10 text-slate-200 text-[10px] rounded px-1.5 py-0.5 font-bold uppercase cursor-pointer focus:outline-none focus:border-cyan-500"
                                >
                                  <option value="patient">Patient</option>
                                  <option value="doctor">Doctor</option>
                                  <option value="hospital">Hospital</option>
                                  <option value="pharmacy">Pharmacy</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>

                              {/* Created At */}
                              <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                                {userCreated}
                              </td>

                              {/* Active State */}
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleToggleStatus(user.id, user.isActive !== false)}
                                  className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-all border ${
                                    user.isActive !== false
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                                  }`}
                                  title={user.isActive !== false ? 'Click to Suspend Account' : 'Click to Activate Account'}
                                >
                                  {user.isActive !== false ? 'Active' : 'Suspended'}
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={user.role === 'admin'}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={user.role === 'admin' ? 'Cannot delete Admin accounts' : 'Delete User Registry'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">
                            No user registry accounts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Broadcast Console Tab Content */}
            {activeTab === 'broadcast' && (
              <motion.div
                key="broadcast"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Broadcast Composer */}
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-white/5 pb-2 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-purple-400" /> Broadcast System Notification Dispatcher
                  </h3>

                  <form onSubmit={handleSendBroadcast} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Target Recipient Role</label>
                        <select
                          value={bcTarget}
                          onChange={(e) => setBcTarget(e.target.value)}
                          className="w-full glass-input text-xs"
                        >
                          <option value="all">All Registries (Patient/Doctor/Hospital)</option>
                          <option value="patient">Patients Only</option>
                          <option value="doctor">Doctors Only</option>
                          <option value="hospital">Hospitals Only</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Notification Category Type</label>
                        <select
                          value={bcType}
                          onChange={(e) => setBcType(e.target.value)}
                          className="w-full glass-input text-xs"
                        >
                          <option value="general">General Broadcast</option>
                          <option value="followup">Followup Check</option>
                          <option value="emergency">Emergency / SOS Advisory</option>
                          <option value="medicine">Medicine Advisory</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Advisory Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Platform Systems Upgrade Scheduled"
                        value={bcTitle}
                        onChange={(e) => setBcTitle(e.target.value)}
                        className="w-full glass-input text-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Advisory Details Message</label>
                      <textarea
                        placeholder="Provide detailed instruction or update content..."
                        value={bcMessage}
                        onChange={(e) => setBcMessage(e.target.value)}
                        className="w-full glass-input text-xs min-h-[100px]"
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={bcSending || !bcTitle || !bcMessage}
                      className="glass-btn-primary py-2 px-6 text-xs font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <Send className="w-4.5 h-4.5 text-black" />
                      {bcSending ? 'Sending Dispatch...' : 'Dispatch Broadcast'}
                    </button>
                  </form>
                </div>

                {/* Dispatch advisory stats */}
                <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-white/5 pb-2">Active Recipient Distribution</h3>
                  
                  <div className="space-y-4 text-xs font-sans">
                    <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 text-purple-400" />
                      <div>
                        <h4 className="font-bold text-xs">Bulk broadcast dispatcher</h4>
                        <p className="text-[10px] text-purple-300 mt-0.5">Enables bulk Mongoose inserts to notify active cohorts immediately.</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-slate-400">
                      <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                        <span>Patients Pool</span>
                        <span className="text-slate-200 font-bold font-mono">{stats.users?.roles?.patient || 0} users</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                        <span>Clinicians Pool</span>
                        <span className="text-slate-200 font-bold font-mono">{stats.users?.roles?.doctor || 0} users</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                        <span>Hospitals Pool</span>
                        <span className="text-slate-200 font-bold font-mono">{stats.users?.roles?.hospital || 0} users</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* System Analytics Tab Content */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* CPU Utilization Chart */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-80">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-3">CPU Utilization Telemetry</h4>
                  <div className="flex-1 w-full text-xs min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockCpuTelemetry}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" />
                        <YAxis stroke="rgba(255,255,255,0.3)" />
                        <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Line type="monotone" dataKey="cpu" name="CPU Usage %" stroke="#a855f7" strokeWidth={2} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Memory Allocation Chart */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-80">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-3">Memory Allocation (RAM)</h4>
                  <div className="flex-1 w-full text-xs min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockMemoryTelemetry}>
                        <defs>
                          <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" />
                        <YAxis stroke="rgba(255,255,255,0.3)" />
                        <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Area type="monotone" dataKey="usage" name="Memory Usage %" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMemory)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* User Signups growth */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-80">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-3">User Signups Growth (7 Days)</h4>
                  <div className="flex-1 w-full text-xs min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockSignupGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" />
                        <YAxis stroke="rgba(255,255,255,0.3)" />
                        <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: '9px' }} />
                        <Bar dataKey="patients" name="Patients" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="clinicians" name="Clinicians" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
