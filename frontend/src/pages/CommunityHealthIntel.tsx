import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ShieldAlert, FileSpreadsheet, Activity, BarChart3
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import screeningService from '../services/screeningService';
import { Screening, User } from '../types';
import { PatientTimeline } from '../components/screening/PatientTimeline';
import patientsJson from '../demo-db/users.json';
import villagesJson from '../demo-db/villages.json';

// Setup Decoupled Patient & Village Data
const patients: User[] = (patientsJson.allUsers as User[]).filter(u => u.role === 'patient');
const villageMap = new Map(villagesJson.map(v => [v.id, v.name]));

export const CommunityHealthIntel: React.FC = () => {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Fetch Screening Records
  useEffect(() => {
    const fetchCaseload = async () => {
      try {
        setLoading(true);
        const data = await screeningService.getScreenings();
        setScreenings(data);
      } catch (error) {
        console.error('Failed to load screenings data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCaseload();
  }, []);

  // 1. Decoupled Aggregation Analytics Engine (Memoized)
  const analytics = useMemo(() => {
    if (screenings.length === 0) return null;

    // Total Screenings & Unique Patients Screened
    const totalScreenings = screenings.length;
    const uniquePatientsCount = new Set(screenings.map(s => s.patientId)).size;

    // Hypertension Classification Metrics
    const htScreenings = screenings.filter(s => s.screeningType === 'Hypertension/Diabetes');
    const htTotal = htScreenings.length || 1;
    const htStats = {
      Normal: htScreenings.filter(s => s.riskClassifications.hypertension === 'Normal').length,
      Prehypertension: htScreenings.filter(s => s.riskClassifications.hypertension === 'Prehypertension').length,
      Stage1: htScreenings.filter(s => s.riskClassifications.hypertension === 'Stage 1').length,
      Stage2: htScreenings.filter(s => s.riskClassifications.hypertension === 'Stage 2').length,
      Crisis: htScreenings.filter(s => s.riskClassifications.hypertension === 'Crisis').length,
    };

    // Diabetes Classification Metrics
    const dbTotal = htScreenings.length || 1;
    const dbStats = {
      Normal: htScreenings.filter(s => s.riskClassifications.diabetes === 'Normal').length,
      Prediabetes: htScreenings.filter(s => s.riskClassifications.diabetes === 'Prediabetes').length,
      Diabetes: htScreenings.filter(s => s.riskClassifications.diabetes === 'Diabetes').length,
    };

    // Anemia Severity Classification Metrics
    const anScreenings = screenings.filter(s => s.screeningType === 'Anemia');
    const anTotal = anScreenings.length || 1;
    const anStats = {
      Normal: anScreenings.filter(s => s.riskClassifications.anemia === 'Normal').length,
      Mild: anScreenings.filter(s => s.riskClassifications.anemia === 'Mild').length,
      Moderate: anScreenings.filter(s => s.riskClassifications.anemia === 'Moderate').length,
      Severe: anScreenings.filter(s => s.riskClassifications.anemia === 'Severe').length,
    };

    // Overall Risk breakdown
    const riskStats = {
      CRITICAL: screenings.filter(s => s.riskClassifications.overall === 'CRITICAL').length,
      HIGH: screenings.filter(s => s.riskClassifications.overall === 'HIGH').length,
      MODERATE: screenings.filter(s => s.riskClassifications.overall === 'MODERATE').length,
      LOW: screenings.filter(s => s.riskClassifications.overall === 'LOW').length,
    };

    // Follow-up Tracking
    const now = new Date();
    const reviewedScreenings = screenings.filter(s => s.status === 'reviewed');
    const completedFollowups = reviewedScreenings.filter(s => s.followUpStatus === 'completed').length;
    
    let pendingFollowups = 0;
    let missedFollowups = 0;

    reviewedScreenings.forEach(s => {
      if (s.followUpStatus === 'pending') {
        if (s.followUpDate && new Date(s.followUpDate) < now) {
          missedFollowups++;
        } else {
          pendingFollowups++;
        }
      }
    });

    // Village Analytics Summary
    const villageStats = villagesJson.map(vil => {
      const vilPatients = patients.filter(p => p.villageId === vil.id);
      const vilPatientIds = new Set(vilPatients.map(p => p.id));
      const vilScreenings = screenings.filter(s => vilPatientIds.has(s.patientId));
      
      const screenedCount = new Set(vilScreenings.map(s => s.patientId)).size;
      const highRisk = vilScreenings.filter(s => s.riskClassifications.overall === 'HIGH' || s.riskClassifications.overall === 'CRITICAL').length;
      const anemiaCases = vilScreenings.filter(s => s.screeningType === 'Anemia' && s.riskClassifications.overall !== 'LOW').length;
      const pendingFollows = vilScreenings.filter(s => s.status === 'reviewed' && s.followUpStatus === 'pending').length;

      return {
        villageId: vil.id,
        name: vil.name,
        population: vil.population,
        adults: vil.adults,
        screenedCount,
        coverage: vil.adults > 0 ? Math.round((screenedCount / vil.adults) * 100) : 0,
        highRisk,
        anemiaCases,
        pendingFollows
      };
    });

    // Coverage KPI Calculations
    const totalAdults = villagesJson.reduce((sum, v) => sum + v.adults, 0);
    const totalScreenedAdults = new Set(screenings.map(s => {
      const p = patients.find(pat => pat.id === s.patientId);
      return p ? p.id : null;
    }).filter(Boolean)).size;
    const coveragePercentage = totalAdults > 0 ? Math.round((totalScreenedAdults / totalAdults) * 100) : 0;

    // Treatment Progress Analysis
    const patientMap = new Map<string, Screening[]>();
    screenings.forEach(s => {
      if (!patientMap.has(s.patientId)) patientMap.set(s.patientId, []);
      patientMap.get(s.patientId)!.push(s);
    });

    let patientsWithMultiple = 0;
    let patientsImproved = 0;
    let patientsStableOrWorse = 0;
    let totalHbImprovement = 0;
    let hbImprovementCount = 0;
    let totalBpSystolicReduction = 0;
    let totalBpDiastolicReduction = 0;
    let bpReductionCount = 0;

    patientMap.forEach((pScreenings) => {
      if (pScreenings.length > 1) {
        patientsWithMultiple++;
        
        // Sort chronologically
        const sorted = [...pScreenings].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const oldest = sorted[0];
        const newest = sorted[sorted.length - 1];

        // Overall Improvement Rate based on Risk Severity Level
        const riskOrder = { 'LOW': 0, 'MODERATE': 1, 'HIGH': 2, 'CRITICAL': 3 };
        const oldRisk = riskOrder[oldest.riskClassifications.overall || 'LOW'];
        const newRisk = riskOrder[newest.riskClassifications.overall || 'LOW'];

        // Hemoglobin improvement analysis
        const oldestHb = oldest.readings.hemoglobin;
        const newestHb = newest.readings.hemoglobin;

        // BP reduction analysis
        const oldestSys = oldest.readings.systolic;
        const newestSys = newest.readings.systolic;
        const oldestDia = oldest.readings.diastolic;
        const newestDia = newest.readings.diastolic;

        let isImproved = false;

        if (oldRisk > newRisk) {
          isImproved = true;
        }

        if (oldestHb !== undefined && newestHb !== undefined) {
          const diff = newestHb - oldestHb;
          totalHbImprovement += diff;
          hbImprovementCount++;
          if (diff > 0.5) isImproved = true; // Substantial increase in Hb
        }

        if (oldestSys !== undefined && newestSys !== undefined && oldestDia !== undefined && newestDia !== undefined) {
          const sysDiff = oldestSys - newestSys;
          const diaDiff = oldestDia - newestDia;
          totalBpSystolicReduction += sysDiff;
          totalBpDiastolicReduction += diaDiff;
          bpReductionCount++;
          if (sysDiff > 5 || diaDiff > 3) isImproved = true; // Drop in BP readings
        }

        if (isImproved) {
          patientsImproved++;
        } else {
          patientsStableOrWorse++;
        }
      }
    });

    const averageHbImprovement = hbImprovementCount > 0 ? parseFloat((totalHbImprovement / hbImprovementCount).toFixed(1)) : 0;
    const averageBpReduction = bpReductionCount > 0 
      ? `${Math.round(totalBpSystolicReduction / bpReductionCount)}/${Math.round(totalBpDiastolicReduction / bpReductionCount)}` 
      : '0/0';
    const improvementRate = patientsWithMultiple > 0 ? Math.round((patientsImproved / patientsWithMultiple) * 100) : 0;

    // Community Alerts Panel Summaries
    const criticalHypertensionList = screenings.filter(
      s => s.screeningType === 'Hypertension/Diabetes' && s.status === 'pending' && s.riskClassifications.overall === 'CRITICAL'
    ).map(s => ({ id: s.id, name: s.patientName, info: `BP: ${s.readings.systolic}/${s.readings.diastolic} mmHg` }));

    const severeAnemiaList = screenings.filter(
      s => s.screeningType === 'Anemia' && s.status === 'pending' && s.riskClassifications.anemia === 'Severe'
    ).map(s => ({ id: s.id, name: s.patientName, info: `Hb: ${s.readings.hemoglobin} g/dL` }));

    const missedFollowupsList = reviewedScreenings.filter(
      s => s.followUpStatus === 'pending' && s.followUpDate && new Date(s.followUpDate) < now
    ).map(s => ({ id: s.id, name: s.patientName, info: `Missed on: ${new Date(s.followUpDate!).toLocaleDateString()}` }));

    const immediateReferralList = screenings.filter(
      s => s.status === 'reviewed' && s.actionTaken === 'referred'
    ).map(s => ({ id: s.id, name: s.patientName, info: `Referred to Specialist` }));

    return {
      totalScreenings,
      uniquePatientsCount,
      htStats,
      htTotal,
      dbStats,
      dbTotal,
      anStats,
      anTotal,
      riskStats,
      completedFollowups,
      pendingFollowups,
      missedFollowups,
      villageStats,
      coveragePercentage,
      totalAdults,
      totalScreenedAdults,
      averageHbImprovement,
      averageBpReduction,
      patientsImproved,
      patientsStableOrWorse,
      patientsWithMultiple,
      improvementRate,
      alerts: {
        criticalHypertensionList,
        severeAnemiaList,
        missedFollowupsList,
        immediateReferralList
      }
    };
  }, [screenings]);

  // Recharts Data Formatters
  const riskChartData = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: 'Critical Risk', value: analytics.riskStats.CRITICAL, color: '#ef4444' },
      { name: 'High Risk', value: analytics.riskStats.HIGH, color: '#f97316' },
      { name: 'Moderate Risk', value: analytics.riskStats.MODERATE, color: '#f59e0b' },
      { name: 'Low Risk', value: analytics.riskStats.LOW, color: '#10b981' }
    ];
  }, [analytics]);

  const followUpChartData = useMemo(() => {
    if (!analytics) return [];
    return [
      { status: 'Completed', count: analytics.completedFollowups },
      { status: 'Pending', count: analytics.pendingFollowups },
      { status: 'Missed', count: analytics.missedFollowups }
    ];
  }, [analytics]);

  // Filter patients list for visual lookups
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return [];
    return patients.filter(
      p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const activePatientTimeline = useMemo(() => {
    if (!selectedPatientId) return null;
    return screenings.filter(s => s.patientId === selectedPatientId);
  }, [selectedPatientId, screenings]);

  const selectedPatientName = useMemo(() => {
    if (!selectedPatientId) return '';
    return patients.find(p => p.id === selectedPatientId)?.name || '';
  }, [selectedPatientId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-xs text-slate-500 font-mono">
        <Activity className="w-5 h-5 animate-spin text-cyan-400 mr-2" />
        Processing rural community intelligence dataset...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Community Health Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Demographic epidemiology summaries, vital diagnostics, and clinic follow-up statistics.
          </p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-white/5 rounded-lg text-slate-500 text-[10px] font-bold cursor-not-allowed hover:bg-slate-900/60"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" /> Export Data (Coming Soon)
        </button>
      </div>

      {analytics ? (
        <>
          {/* Section 1: KPI Statistics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="glass-card p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">People Screened</span>
              <span className="text-2xl font-black block mt-2 text-cyan-400">{analytics.uniquePatientsCount}</span>
              <span className="text-[9px] text-slate-450 block mt-1">{analytics.totalScreenings} screenings logs</span>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Screening Coverage</span>
              <span className="text-2xl font-black block mt-2 text-cyan-400">{analytics.coveragePercentage}%</span>
              <span className="text-[9px] text-slate-450 block mt-1">{analytics.totalScreenedAdults} of {analytics.totalAdults} adults</span>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Improvement Rate</span>
              <span className="text-2xl font-black block mt-2 text-emerald-450">{analytics.improvementRate}%</span>
              <span className="text-[9px] text-slate-450 block mt-1">{analytics.patientsImproved} of {analytics.patientsWithMultiple} tracked patients</span>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avg Hb Improvement</span>
              <span className="text-2xl font-black block mt-2 text-emerald-400">+{analytics.averageHbImprovement} <span className="text-xs font-normal">g/dL</span></span>
              <span className="text-[9px] text-slate-450 block mt-1">Gestational progress trends</span>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avg BP Reduction</span>
              <span className="text-2xl font-black block mt-2 text-emerald-400">{analytics.averageBpReduction} <span className="text-xs font-normal">mmHg</span></span>
              <span className="text-[9px] text-slate-450 block mt-1">Systolic/Diastolic reduction</span>
            </div>
          </div>

          {/* Section 2: Visualizations Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Risk Breakdown Pie Chart (5 Cols) */}
            <div className="lg:col-span-5 glass-card p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">Population Triage Risk Split</h3>
              <div className="h-60 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={4}
                    >
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-350 font-sans">
                {riskChartData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5 justify-center">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                    <span className="font-semibold">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Tracking Bar Chart (7 Cols) */}
            <div className="lg:col-span-7 glass-card p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">Clinician Follow-up Caseload Outcomes</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={followUpChartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <XAxis dataKey="status" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 11 }} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={45}>
                      <Cell fill="#10b981" />
                      <Cell fill="#64748b" />
                      <Cell fill="#ef4444" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around text-[10px] font-mono text-slate-450 border-t border-white/5 pt-2">
                <span>Completed: {analytics.completedFollowups}</span>
                <span>Pending: {analytics.pendingFollowups}</span>
                <span>Missed: {analytics.missedFollowups}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Diagnostic Ratios & Ratios Detail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hypertension Ratios */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">BP Diagnostic Caseloads</h3>
              <div className="space-y-2">
                {[
                  { label: 'Normal BP', count: analytics.htStats.Normal, color: 'bg-emerald-500' },
                  { label: 'Prehypertension', count: analytics.htStats.Prehypertension, color: 'bg-amber-500' },
                  { label: 'Stage 1 HTN', count: analytics.htStats.Stage1, color: 'bg-orange-500' },
                  { label: 'Stage 2 HTN', count: analytics.htStats.Stage2, color: 'bg-rose-500' },
                  { label: 'Crisis Alert', count: analytics.htStats.Crisis, color: 'bg-rose-700' }
                ].map((item, idx) => {
                  const pct = analytics.htTotal > 0 ? Math.round((item.count / analytics.htTotal) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span>{item.label}</span>
                        <span className="font-mono font-bold">{item.count} cases ({pct}%)</span>
                      </div>
                      <div className="w-full bg-[#0b1120] rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Diabetes Ratios */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">Glucose Diagnostic Caseloads</h3>
              <div className="space-y-2">
                {[
                  { label: 'Normal Glucose', count: analytics.dbStats.Normal, color: 'bg-emerald-500' },
                  { label: 'Prediabetes', count: analytics.dbStats.Prediabetes, color: 'bg-amber-500' },
                  { label: 'Diabetes', count: analytics.dbStats.Diabetes, color: 'bg-rose-500' }
                ].map((item, idx) => {
                  const pct = analytics.dbTotal > 0 ? Math.round((item.count / analytics.dbTotal) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span>{item.label}</span>
                        <span className="font-mono font-bold">{item.count} cases ({pct}%)</span>
                      </div>
                      <div className="w-full bg-[#0b1120] rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Anemia Ratios */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">Anemia Diagnostic Caseloads</h3>
              <div className="space-y-2">
                {[
                  { label: 'Normal Hemoglobin', count: analytics.anStats.Normal, color: 'bg-emerald-500' },
                  { label: 'Mild Anemia', count: analytics.anStats.Mild, color: 'bg-amber-500' },
                  { label: 'Moderate Anemia', count: analytics.anStats.Moderate, color: 'bg-orange-500' },
                  { label: 'Severe Anemia Alert', count: analytics.anStats.Severe, color: 'bg-rose-500' }
                ].map((item, idx) => {
                  const pct = analytics.anTotal > 0 ? Math.round((item.count / analytics.anTotal) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span>{item.label}</span>
                        <span className="font-mono font-bold">{item.count} cases ({pct}%)</span>
                      </div>
                      <div className="w-full bg-[#0b1120] rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Village Summary Table & Community Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Village comparison table (7 cols) */}
            <div className="lg:col-span-7 glass-card p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">Village caselists summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-bold text-[10px] uppercase">
                      <th className="py-2.5">Village Name</th>
                      <th className="py-2.5">Coverage %</th>
                      <th className="py-2.5">Total Screened</th>
                      <th className="py-2.5 text-center">High Risk</th>
                      <th className="py-2.5 text-center">Anemia Cases</th>
                      <th className="py-2.5 text-center">Pending Follows</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.villageStats.map((vil, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01]">
                        <td className="py-3 font-semibold text-slate-200">{vil.name}</td>
                        <td className="py-3 font-mono font-bold text-cyan-400">{vil.coverage}%</td>
                        <td className="py-3 text-slate-300">{vil.screenedCount} villagers</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${vil.highRisk > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
                            {vil.highRisk}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${vil.anemiaCases > 0 ? 'bg-orange-500/10 text-orange-400' : 'bg-slate-800 text-slate-500'}`}>
                            {vil.anemiaCases}
                          </span>
                        </td>
                        <td className="py-3 text-center text-slate-300">{vil.pendingFollows} cases</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Community Alerts Panel (5 cols) */}
            <div className="lg:col-span-5 glass-card p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> Community Alerts Panel
              </h3>
              
              <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                {/* Critical Hypertension Alert */}
                {analytics.alerts.criticalHypertensionList.length > 0 && (
                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-rose-450 uppercase text-[9px] tracking-wider block">🚨 Critical Hypertension ({analytics.alerts.criticalHypertensionList.length})</span>
                    <div className="space-y-1 font-sans">
                      {analytics.alerts.criticalHypertensionList.map(a => (
                        <div key={a.id} className="flex justify-between items-center text-slate-300">
                          <span>{a.name}</span>
                          <span className="font-mono text-slate-450 text-[10px]">{a.info}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Severe Anemia Alert */}
                {analytics.alerts.severeAnemiaList.length > 0 && (
                  <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-red-405 uppercase text-[9px] tracking-wider block">🩸 Severe Anemia ({analytics.alerts.severeAnemiaList.length})</span>
                    <div className="space-y-1 font-sans">
                      {analytics.alerts.severeAnemiaList.map(a => (
                        <div key={a.id} className="flex justify-between items-center text-slate-300">
                          <span>{a.name}</span>
                          <span className="font-mono text-slate-455 text-[10px]">{a.info}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missed Follow-ups Alert */}
                {analytics.alerts.missedFollowupsList.length > 0 && (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-amber-450 uppercase text-[9px] tracking-wider block">⚠️ Missed Clinician Follow-up ({analytics.alerts.missedFollowupsList.length})</span>
                    <div className="space-y-1 font-sans">
                      {analytics.alerts.missedFollowupsList.map(a => (
                        <div key={a.id} className="flex justify-between items-center text-slate-300">
                          <span>{a.name}</span>
                          <span className="font-mono text-slate-450 text-[10px]">{a.info}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Immediate Referrals Alert */}
                {analytics.alerts.immediateReferralList.length > 0 && (
                  <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-cyan-400 uppercase text-[9px] tracking-wider block">🏥 Active Emergency Specialist Referrals ({analytics.alerts.immediateReferralList.length})</span>
                    <div className="space-y-1 font-sans">
                      {analytics.alerts.immediateReferralList.map(a => (
                        <div key={a.id} className="flex justify-between items-center text-slate-300">
                          <span>{a.name}</span>
                          <span className="font-mono text-slate-450 text-[10px]">{a.info}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.alerts.criticalHypertensionList.length === 0 &&
                 analytics.alerts.severeAnemiaList.length === 0 &&
                 analytics.alerts.missedFollowupsList.length === 0 &&
                 analytics.alerts.immediateReferralList.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-6">No clinical alerts flagged today.</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Real-time Patient Case Finder / Timeline View */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Patient Case Lookup</h3>
              <p className="text-xs text-slate-500 mt-1">Search patient name or ID to view their visual timeline care journey details.</p>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search patient name (e.g. Priya, Anshuman)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-250 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {searchTerm && (
              <div className="bg-[#0b1120] border border-white/5 rounded-xl p-2 max-h-40 overflow-y-auto space-y-1 max-w-md animate-fadeIn">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setSearchTerm('');
                      }}
                      className="w-full p-2.5 rounded-lg text-left text-xs flex justify-between items-center hover:bg-white/[0.02] text-slate-300"
                    >
                      <span className="font-semibold">{p.name} {p.villageId ? `(${villageMap.get(p.villageId) || 'Rampur'})` : ''}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{p.id}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-500 p-2 italic text-center">No patients matched</p>
                )}
              </div>
            )}

            {/* Render selected patient timeline */}
            {selectedPatientId && activePatientTimeline && (
              <div className="border-t border-white/5 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350">
                    Care Timeline: <span className="text-cyan-400 font-bold">{selectedPatientName}</span>
                  </h4>
                  <button
                    onClick={() => setSelectedPatientId(null)}
                    className="text-[10px] text-rose-450 hover:underline uppercase font-bold"
                  >
                    Close Caselist
                  </button>
                </div>
                <div className="bg-slate-950/20 p-4 rounded-xl border border-white/5">
                  <PatientTimeline screenings={activePatientTimeline} />
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-slate-500 italic text-xs">
          No campaign screening records found in the database.
        </div>
      )}
    </div>
  );
};

export default CommunityHealthIntel;
