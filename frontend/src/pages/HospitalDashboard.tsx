import React, { useState, useEffect } from 'react';
import { 
  Building, Activity, Save, Truck, Clock, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import hospitalService from '../services/hospitalService';
import { Hospital } from '../types';
import { MetricCard } from '../components/cards/MetricCard';
import { CardSkeleton, SuccessState } from '../components/common/Loader';

// Mock Operations Datasets
const departmentsData = [
  { name: 'Emergency ER', occupied: 18, total: 20 },
  { name: 'Cardiology ICU', occupied: 8, total: 10 },
  { name: 'Pediatrics', occupied: 14, total: 25 },
  { name: 'Oncology', occupied: 10, total: 15 },
  { name: 'General Medicine', occupied: 45, total: 60 }
];

const specialistsData = [
  { name: 'Dr. Sarika Sharma', specialty: 'Cardiologist', status: 'On Duty', room: 'ICU-3' },
  { name: 'Dr. Rajesh Patel', specialty: 'Dermatologist', status: 'On Call', room: 'OPD-2' },
  { name: 'Dr. Neha Das', specialty: 'Pediatrician', status: 'On Duty', room: 'Ward-B' },
  { name: 'Dr. Arvind Sen', specialty: 'Surgeon', status: 'In Surgery', room: 'OT-1' },
  { name: 'Dr. Amit Roy', specialty: 'Oncologist', status: 'Off Duty', room: 'N/A' }
];

const ambulanceData = [
  { id: 'AMB-101', driver: 'Rahul Singh', status: 'En Route', destination: 'Gurgaon Sector 45', eta: '4 mins' },
  { id: 'AMB-102', driver: 'Sanjay Kumar', status: 'Dispatched', destination: 'Delhi Outer Circle', eta: '9 mins' },
  { id: 'AMB-103', driver: 'Vijay Nair', status: 'Returning', destination: 'Hospital Depot', eta: '3 mins' },
  { id: 'AMB-104', driver: 'Amit Verma', status: 'Idle', destination: 'Hospital Depot', eta: 'N/A' }
];

const otScheduleData = [
  { id: 'OT-A', patient: 'Ritu Sen', surgeon: 'Dr. Arvind Sen', procedure: 'Coronary Angioplasty', time: '11:00 AM', status: 'In Progress' },
  { id: 'OT-B', patient: 'Rahul Mishra', surgeon: 'Dr. Sarika Sharma', procedure: 'Pacemaker Implantation', time: '02:30 PM', status: 'Scheduled' },
  { id: 'OT-C', patient: 'Vijay Nair', surgeon: 'Dr. Neha Das', procedure: 'Emergency Appendectomy', time: '09:15 AM', status: 'Completed' }
];

const resourceData = [
  { name: 'Oxygen Pressure', value: 92, unit: '%', level: 'Optimal' },
  { name: 'Active Ventilators', value: 14, unit: '/18', level: 'Busy' },
  { name: 'ICU Patient Monitors', value: 22, unit: '/25', level: 'Optimal' },
  { name: 'Blood Plasma Stock', value: 45, unit: 'units', level: 'Reorder Warn' }
];

// Analytics Datasets
const erFlowData = [
  { hour: '08:00', admissions: 4 },
  { hour: '10:00', admissions: 9 },
  { hour: '12:00', admissions: 12 },
  { hour: '14:00', admissions: 15 },
  { hour: '16:00', admissions: 8 },
  { hour: '18:00', admissions: 14 },
  { hour: '20:00', admissions: 18 },
  { hour: '22:00', admissions: 10 }
];

const bedUtilizationData = [
  { name: 'ICU Beds Occupied', value: 26 },
  { name: 'ICU Beds Free', value: 9 },
  { name: 'General Wards Occupied', value: 59 },
  { name: 'General Wards Free', value: 26 }
];

const ambulanceDispatchData = [
  { time: '10:00', count: 2 },
  { time: '12:00', count: 5 },
  { time: '14:00', count: 8 },
  { time: '16:00', count: 6 },
  { time: '18:00', count: 9 },
  { time: '20:00', count: 12 },
  { time: '22:00', count: 7 }
];

const COLORS = ['#f43f5e', '#22d3ee', '#a855f7', '#34d399'];

export const HospitalDashboard: React.FC = () => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [bedsInput, setBedsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active Layout Tab: 'overview' | 'emergency' | 'roster' | 'analytics'
  const [activeTab, setActiveTab] = useState<'overview' | 'emergency' | 'roster' | 'analytics'>('overview');

  const fetchHospital = async () => {
    try {
      const data = await hospitalService.getHospitals();
      const current = data[0];
      setHospital(current);
      setBedsInput(current.bedsAvailable.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospital();
    
    const handleDemoRefresh = () => {
      fetchHospital();
    };
    window.addEventListener('medibridge-demo-refresh', handleDemoRefresh);
    return () => {
      window.removeEventListener('medibridge-demo-refresh', handleDemoRefresh);
    };
  }, []);

  const handleUpdateBeds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital) return;
    setSaving(true);
    try {
      const parsedBeds = parseInt(bedsInput) || 0;
      const updated = await hospitalService.updateHospitalBeds(hospital.id, parsedBeds);
      setHospital(updated);
      setSuccessMsg(`Beds capacity inventory updated to ${parsedBeds} available.`);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const calculateTotalBeds = () => {
    return departmentsData.reduce((acc, curr) => acc + curr.total, 0);
  };

  const calculateOccupiedBeds = () => {
    return departmentsData.reduce((acc, curr) => acc + curr.occupied, 0);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-slate-850 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Header operations area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans">Hospital Operations Command</h2>
          <p className="text-xs text-slate-400 mt-1">Configure emergency dispatch queues, log OT bookings, and audit bed occupancies.</p>
        </div>

        <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-white/5 w-fit font-bold text-[10px]">
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
            onClick={() => setActiveTab('emergency')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'emergency'
                ? 'bg-[#1e293b] text-rose-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ER & Dispatches
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'roster'
                ? 'bg-[#1e293b] text-amber-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OT & Roster
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#1e293b] text-emerald-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {hospital && (
        <>
          {/* Main Operational Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Admissions Capacity"
              value={`${hospital.bedsAvailable} available`}
              subtext={`Occupancy: ${calculateOccupiedBeds()} / ${calculateTotalBeds()} beds`}
              icon={<Building className="w-4.5 h-4.5" />}
              accentColor="cyan"
            />
            <MetricCard
              title="Trauma Ward Status"
              value={hospital.emergencyAvailable ? 'ER Standby Active' : 'ER Suspended'}
              subtext="ER active triage response online"
              icon={<Activity className="w-4.5 h-4.5" />}
              accentColor="rose"
            />
            <MetricCard
              title="Active Fleet"
              value={`${ambulanceData.filter(a => a.status !== 'Idle').length} dispatched`}
              subtext="4 ambulances standby"
              icon={<Truck className="w-4.5 h-4.5" />}
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
                {/* Available Beds Modifier */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 h-fit">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Admissions Capacity Editor</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Quickly alter available trauma/normal beds inventory.</p>
                  </div>
                  <form onSubmit={handleUpdateBeds} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Available Beds</label>
                      <input
                        type="number"
                        value={bedsInput}
                        onChange={(e) => setBedsInput(e.target.value)}
                        className="w-full glass-input text-xs"
                        required
                      />
                    </div>
                    <button type="submit" disabled={saving} className="glass-btn-primary w-full text-xs py-2 flex items-center justify-center gap-2">
                      <Save className="w-4 h-4 text-black" /> {saving ? 'Syncing...' : 'Update Inventory'}
                    </button>
                  </form>
                </div>

                {/* Departments list */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-white/5 pb-2">Departmental Beds Status</h3>
                  <div className="space-y-3.5">
                    {departmentsData.map((dept, i) => {
                      const percentage = Math.round((dept.occupied / dept.total) * 100);
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-300">{dept.name}</span>
                            <span className="text-slate-400 font-mono">{dept.occupied}/{dept.total} ({percentage}%)</span>
                          </div>
                          <div className="h-1.5 bg-slate-800/40 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                percentage > 85 ? 'bg-rose-500' : 'bg-cyan-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resource monitoring */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-white/5 pb-2">Critical Resources Audit</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {resourceData.map((res, i) => {
                      const isWarn = res.level.includes('Warn') || res.level.includes('Busy');
                      return (
                        <div key={i} className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                          <span className="text-[10px] text-slate-500 font-semibold block uppercase">{res.name}</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-slate-200">{res.value}</span>
                            <span className="text-xs text-slate-500">{res.unit}</span>
                          </div>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            isWarn ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {res.level}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Emergency & Ambulances Tab Content */}
            {activeTab === 'emergency' && (
              <motion.div
                key="emergency"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Live Ambulance Tracker */}
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Active Dispatch Ambulance Tracker</h3>
                    <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full font-bold">LIVE TELEMETRY</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ambulanceData.map((amb, i) => (
                      <div 
                        key={i} 
                        className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                          amb.status === 'Idle' 
                            ? 'bg-white/[0.01] border-white/5' 
                            : 'bg-rose-500/[0.02] border-rose-500/20 shadow-glow-rose'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Truck className={`w-4 h-4 ${amb.status === 'Idle' ? 'text-slate-500' : 'text-rose-400'}`} />
                            <h4 className="text-xs font-bold text-slate-200">{amb.id}</h4>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">Driver: {amb.driver}</p>
                          <p className="text-[9px] text-slate-500">Destination: {amb.destination}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider block ${
                            amb.status === 'En Route' 
                              ? 'bg-rose-500/20 text-rose-400' 
                              : amb.status === 'Idle' 
                              ? 'bg-slate-800 text-slate-500' 
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {amb.status}
                          </span>
                          {amb.eta !== 'N/A' && (
                            <span className="text-[9px] text-slate-400 flex items-center gap-1 font-mono justify-end">
                              <Clock className="w-3 h-3 text-slate-500" /> ETA: {amb.eta}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Ward statistics */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-white/5 pb-2">Emergency ER status</h3>
                  
                  <div className="space-y-4 text-xs font-sans">
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse text-rose-400" />
                      <div>
                        <h4 className="font-bold text-xs">ER Capacity warning</h4>
                        <p className="text-[10px] text-rose-300 mt-0.5">Emergency ER is currently operating at 90% capacity. Prepare backup admissions ICU beds.</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-slate-400">
                      <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                        <span>Patients in Triage</span>
                        <span className="text-slate-200 font-bold font-mono">18 patients</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                        <span>Average Waiting Time</span>
                        <span className="text-slate-200 font-bold font-mono">12 mins</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                        <span>Standby Ventilators</span>
                        <span className="text-emerald-400 font-bold font-mono">4 units</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Specialist & Surgical Schedules Tab Content */}
            {activeTab === 'roster' && (
              <motion.div
                key="roster"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Specialists Duty Roster */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-white/5 pb-2">Duty Specialists Registry</h3>
                  <div className="space-y-3">
                    {specialistsData.map((spec, i) => (
                      <div key={i} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/20">
                            {spec.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-200">{spec.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">{spec.specialty} • Rm: {spec.room}</p>
                          </div>
                        </div>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          spec.status === 'On Duty' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : spec.status === 'In Surgery' 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' 
                            : spec.status === 'On Call' 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {spec.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operation Schedules */}
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-white/5 pb-2">OT Bookings & Surgical Schedules</h3>
                  
                  <div className="space-y-3.5">
                    {otScheduleData.map((ot, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{ot.id}</span>
                            <h4 className="text-xs font-bold text-slate-200">{ot.procedure}</h4>
                          </div>
                          <p className="text-[11px] text-slate-400">Patient: {ot.patient} • Surgeon: {ot.surgeon}</p>
                          <p className="text-[10px] text-slate-500 font-mono">Scheduled: {ot.time}</p>
                        </div>

                        <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider self-start md:self-center ${
                          ot.status === 'In Progress' 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' 
                            : ot.status === 'Scheduled' 
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                            : 'bg-slate-800 text-slate-500 border border-white/5'
                        }`}>
                          {ot.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Emergency Operations Analytics Tab Content */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* ER Patient Flow Chart */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-80">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-3">ER Patient Inflow</h4>
                  <div className="flex-1 w-full text-xs min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={erFlowData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} />
                        <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Bar dataKey="admissions" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={25} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bed Utilization Donut Chart */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-80">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-3">ICU/General Bed Allocation</h4>
                  <div className="flex-1 w-full text-xs min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bedUtilizationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {bedUtilizationData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '9px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ambulance Dispatches Area Chart */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-80">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-3">Ambulance Dispatch Load</h4>
                  <div className="flex-1 w-full text-xs min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ambulanceDispatchData}>
                        <defs>
                          <linearGradient id="colorAmb" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" />
                        <YAxis stroke="rgba(255,255,255,0.3)" />
                        <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Area type="monotone" dataKey="count" name="Dispatches" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorAmb)" />
                      </AreaChart>
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

export default HospitalDashboard;
