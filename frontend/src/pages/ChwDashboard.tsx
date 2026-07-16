import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Check, AlertCircle, RefreshCw, 
  ClipboardList, User, PlusCircle, ListTodo, MapPin, Package, Award, ChevronRight, CheckSquare, Square
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import adminService from '../services/adminService';
import screeningService from '../services/screeningService';
import { Screening, User as UserType } from '../types';
import { RiskEngine } from '../clinicalRules';
import villagesJson from '../demo-db/villages.json';

const villageNames: Record<string, string> = {
  vil_01: 'Rampur',
  vil_02: 'Lakshmipur',
  vil_03: 'Devgaon'
};

export const ChwDashboard: React.FC = () => {
  const { addNotification } = useApp();
  const [patients, setPatients] = useState<UserType[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab State: 'outreach' | 'new-screening' | 'history'
  const [activeTab, setActiveTab] = useState<'outreach' | 'new-screening' | 'history'>('outreach');

  // Search & Form State
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<UserType | null>(null);
  
  // Screening Type Switcher
  const [screeningType, setScreeningType] = useState<string>('Hypertension/Diabetes');

  // Hypertension & Diabetes Vitals State
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [bloodSugar, setBloodSugar] = useState<string>('');
  const [bloodSugarType, setBloodSugarType] = useState<'fasting' | 'random'>('random');

  // Anemia Vitals State
  const [hemoglobin, setHemoglobin] = useState<string>('');
  const [isPregnant, setIsPregnant] = useState<boolean>(false);
  const [trimester, setTrimester] = useState<string>('');
  const [ageGroup, setAgeGroup] = useState<'child' | 'adolescent' | 'adult'>('adult');
  const [weight, setWeight] = useState<string>('');
  const [ifaStarted, setIfaStarted] = useState<boolean>(false);

  // Tuberculosis Vitals State
  const [cough, setCough] = useState<boolean>(false);
  const [fever, setFever] = useState<boolean>(false);
  const [nightSweats, setNightSweats] = useState<boolean>(false);
  const [weightLoss, setWeightLoss] = useState<boolean>(false);

  // Vitals Warnings
  const [bpWarning, setBpWarning] = useState<string | null>(null);
  const [bsWarning, setBsWarning] = useState<string | null>(null);
  const [hemoWarning, setHemoWarning] = useState<string | null>(null);

  // ─── Outreach Home Visit Form State ──────────────────────────────────────────
  const [activeVisitPatientId, setActiveVisitPatientId] = useState<string | null>(null);
  const [visitMedTaken, setVisitMedTaken] = useState<boolean>(true);
  const [visitSymptoms, setVisitSymptoms] = useState<string>('');
  const [visitSystolic, setVisitSystolic] = useState<string>('');
  const [visitDiastolic, setVisitDiastolic] = useState<string>('');
  const [visitSugar, setVisitSugar] = useState<string>('');
  const [visitHb, setVisitHb] = useState<string>('');
  const [visitNotes, setVisitNotes] = useState<string>('');
  const [visitNextDate, setVisitNextDate] = useState<string>('');

  // ─── Medicine Stock Distribution Tracker ─────────────────────────────────────
  const [medStocks, setMedStocks] = useState<{ id: string; name: string; count: number; status: 'Distributed' | 'Pending' | 'Out of Stock' }[]>([
    { id: 'm1', name: 'Iron & Folic Acid (IFA) Tablets', count: 120, status: 'Distributed' },
    { id: 'm2', name: 'Hypertension Medicines (Amlodipine)', count: 90, status: 'Distributed' },
    { id: 'm3', name: 'Diabetes Medicines (Metformin)', count: 75, status: 'Pending' }
  ]);

  // ─── Screening Requests Queue State ─────────────────────────────────────────
  const [screeningRequests, setScreeningRequests] = useState<any[]>([]);
  const [schedulingReqId, setSchedulingReqId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>('');

  // Load Patients and Screenings
  const loadData = async () => {
    try {
      setLoading(true);
      const [allPatients, allScreenings] = await Promise.all([
        adminService.getUsers(undefined, 'patient'),
        screeningService.getScreenings()
      ]);
      setPatients(allPatients);
      setScreenings(allScreenings);

      const rawReq = localStorage.getItem('demo_db_screening_requests');
      if (rawReq) {
        setScreeningRequests(JSON.parse(rawReq));
      } else {
        setScreeningRequests([]);
      }
    } catch (err) {
      console.error('Error fetching CHW workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleDemoRefresh = () => {
      loadData();
    };
    window.addEventListener('medibridge-demo-refresh', handleDemoRefresh);
    return () => {
      window.removeEventListener('medibridge-demo-refresh', handleDemoRefresh);
    };
  }, []);

  // Update selected patient profile details
  useEffect(() => {
    if (selectedPatientId) {
      const match = patients.find(p => p.id === selectedPatientId);
      setSelectedPatient(match || null);
    } else {
      setSelectedPatient(null);
    }
  }, [selectedPatientId, patients]);

  // Vitals Inputs Validation & Warning Hooks
  useEffect(() => {
    const sysNum = parseInt(systolic, 10);
    const diaNum = parseInt(diastolic, 10);
    if (systolic && (isNaN(sysNum) || sysNum < 70 || sysNum > 240)) {
      setBpWarning('Systolic blood pressure range should be between 70 and 240.');
    } else if (diastolic && (isNaN(diaNum) || diaNum < 40 || diaNum > 150)) {
      setBpWarning('Diastolic blood pressure range should be between 40 and 150.');
    } else {
      setBpWarning(null);
    }
  }, [systolic, diastolic]);

  useEffect(() => {
    const bsNum = parseInt(bloodSugar, 10);
    if (bloodSugar && (isNaN(bsNum) || bsNum < 40 || bsNum > 500)) {
      setBsWarning('Blood glucose level should be between 40 and 500 mg/dL.');
    } else {
      setBsWarning(null);
    }
  }, [bloodSugar]);

  useEffect(() => {
    const hemoNum = parseFloat(hemoglobin);
    if (hemoglobin && (isNaN(hemoNum) || hemoNum < 3.0 || hemoNum > 22.0)) {
      setHemoWarning('Hemoglobin level must be between 3.0 and 22.0 g/dL.');
    } else {
      setHemoWarning(null);
    }
  }, [hemoglobin]);

  const resetForm = () => {
    setSelectedPatientId('');
    setSelectedPatient(null);
    setSystolic('');
    setDiastolic('');
    setBloodSugar('');
    setHemoglobin('');
    setIsPregnant(false);
    setTrimester('');
    setWeight('');
    setIfaStarted(false);
    setCough(false);
    setFever(false);
    setNightSweats(false);
    setWeightLoss(false);
    setBpWarning(null);
    setBsWarning(null);
    setHemoWarning(null);
  };

  // Submit standard screening form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setErrorMsg('Please select a patient before submitting.');
      return;
    }

    if (bpWarning || bsWarning || hemoWarning) {
      setErrorMsg('Please fix vitals validation errors before submitting.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const targetPatient = patients.find(p => p.id === selectedPatientId);
      if (!targetPatient) throw new Error('Patient not found');

      let readings: any = {};
      if (screeningType === 'Hypertension/Diabetes') {
        if (!systolic || !diastolic || !bloodSugar) {
          throw new Error('Please fill in blood pressure and glucose readings.');
        }
        readings = {
          systolic: parseInt(systolic, 10),
          diastolic: parseInt(diastolic, 10),
          bloodSugar: parseInt(bloodSugar, 10),
          bloodSugarType
        };
      } else if (screeningType === 'Anemia') {
        if (!hemoglobin || !weight) {
          throw new Error('Please fill in hemoglobin level and body weight.');
        }
        readings = {
          hemoglobin: parseFloat(hemoglobin),
          isPregnant,
          trimester: trimester ? parseInt(trimester, 10) : undefined,
          ageGroup,
          weight: parseFloat(weight),
          ifaStarted
        };
      } else {
        readings = { tbSymptoms: [] };
        if (cough) readings.tbSymptoms.push('Cough > 2 weeks');
        if (fever) readings.tbSymptoms.push('Fever');
        if (nightSweats) readings.tbSymptoms.push('Night Sweats');
        if (weightLoss) readings.tbSymptoms.push('Unexplained Weight Loss');
      }

      const res = await screeningService.createScreening({
        patientId: selectedPatientId,
        patientName: targetPatient.name,
        screeningType,
        readings
      });

      // Update active request status if conducting screening for a requested visit
      const activeReqId = localStorage.getItem('medibridge_active_request_id');
      if (activeReqId) {
        const rawReqs = localStorage.getItem('demo_db_screening_requests');
        if (rawReqs) {
          const reqList = JSON.parse(rawReqs);
          const reqIdx = reqList.findIndex((r: any) => r.id === activeReqId);
          if (reqIdx !== -1) {
            reqList[reqIdx].status = 'screened';
            localStorage.setItem('demo_db_screening_requests', JSON.stringify(reqList));
          }
        }
        localStorage.removeItem('medibridge_active_request_id');
      }

      setScreenings(prev => [res, ...prev]);
      setSuccessMsg(`Screening successfully saved for ${targetPatient.name}. Vitals triage is pending clinician evaluation.`);
      addNotification(
        'Vitals Uploaded',
        `Triage file submitted for patient ${targetPatient.name}. Vitals: ${screeningType}.`,
        'general'
      );
      resetForm();
      setActiveTab('history');
      window.dispatchEvent(new Event('medibridge-demo-refresh'));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit screening vitals.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Home Visit Log
  const handleHomeVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisitPatientId) return;

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const patient = patients.find(p => p.id === activeVisitPatientId);
      if (!patient) throw new Error('Patient not found');

      const patientLogs = screenings.filter(s => s.patientId === activeVisitPatientId);
      const latestFollowup = patientLogs.find(s => s.status === 'reviewed' && s.followUpStatus === 'pending');

      if (latestFollowup) {
        await screeningService.updateFollowUpStatus(latestFollowup.id, 'completed');
      }

      let readings: any = {};
      let typeOfScreening = latestFollowup?.screeningType || 'Hypertension/Diabetes';

      if (typeOfScreening === 'Hypertension/Diabetes') {
        readings = {
          systolic: visitSystolic ? parseInt(visitSystolic, 10) : 120,
          diastolic: visitDiastolic ? parseInt(visitDiastolic, 10) : 80,
          bloodSugar: visitSugar ? parseInt(visitSugar, 10) : 110,
          bloodSugarType: 'random'
        };
      } else {
        readings = {
          hemoglobin: visitHb ? parseFloat(visitHb) : 11.5,
          weight: 55,
          isPregnant: false,
          ifaStarted: visitMedTaken
        };
      }

      await screeningService.createScreening({
        patientId: activeVisitPatientId,
        patientName: patient.name,
        screeningType: typeOfScreening,
        readings
      });

      setSuccessMsg(`Home Visit logged for ${patient.name}. Follow-up marked completed and new vitals submitted for review.`);
      addNotification(
        'Home Visit Logged',
        `Logged home visit telemetry for ${patient.name}. Directives updated.`,
        'followup'
      );
      
      setActiveVisitPatientId(null);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to log home visit parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Stock Distribution Status
  const toggleStockStatus = (id: string) => {
    setMedStocks(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'Distributed' ? 'Pending' : m.status === 'Pending' ? 'Out of Stock' : 'Distributed';
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  // ─── Outreach Queue Handlers ──────────────────────────────────────────────────
  const handleAcceptRequest = (reqId: string) => {
    const raw = localStorage.getItem('demo_db_screening_requests');
    if (raw) {
      const list = JSON.parse(raw);
      const idx = list.findIndex((r: any) => r.id === reqId);
      if (idx !== -1) {
        list[idx].status = 'accepted';
        list[idx].assignedChwId = 'user_chw_01';
        list[idx].assignedChwName = 'Ramesh Kumar';
        localStorage.setItem('demo_db_screening_requests', JSON.stringify(list));
        addNotification('Request Accepted', 'You have accepted the community screening request.', 'general');
        loadData();
        window.dispatchEvent(new Event('medibridge-demo-refresh'));
      }
    }
  };

  const handleSaveSchedule = (reqId: string) => {
    if (!scheduleDate) {
      alert('Please select a visit date.');
      return;
    }
    const raw = localStorage.getItem('demo_db_screening_requests');
    if (raw) {
      const list = JSON.parse(raw);
      const idx = list.findIndex((r: any) => r.id === reqId);
      if (idx !== -1) {
        list[idx].status = 'scheduled';
        list[idx].scheduledVisitDate = scheduleDate;
        localStorage.setItem('demo_db_screening_requests', JSON.stringify(list));
        addNotification('Visit Scheduled', `Home visit scheduled for ${new Date(scheduleDate).toLocaleDateString()}`, 'general');
        setSchedulingReqId(null);
        setScheduleDate('');
        loadData();
        window.dispatchEvent(new Event('medibridge-demo-refresh'));
      }
    }
  };

  const handleConductScreening = (req: any) => {
    setSelectedPatientId(req.patientId);
    if (req.screeningType.includes('Blood Pressure')) {
      setScreeningType('Hypertension/Diabetes');
    } else if (req.screeningType.includes('Diabetes')) {
      setScreeningType('Hypertension/Diabetes');
    } else if (req.screeningType.includes('Anemia')) {
      setScreeningType('Anemia');
    } else {
      setScreeningType('Hypertension/Diabetes');
    }
    localStorage.setItem('medibridge_active_request_id', req.id);
    setActiveTab('new-screening');
  };

  // Filter patients list based on search term
  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(patientSearch.toLowerCase())
    );
  }, [patients, patientSearch]);

  // ─── Computed Outreach Workplace Metrics ─────────────────────────────────────
  const uniquePatients = useMemo(() => new Set(screenings.map(s => s.patientId)).size, [screenings]);
  const highRiskCount = useMemo(() => screenings.filter(s => s.riskClassifications.overall === 'HIGH' || s.riskClassifications.overall === 'CRITICAL').length, [screenings]);

  // Assigned Village coverage list
  const villageOutreachStats = useMemo(() => {
    return villagesJson.map(vil => {
      const vilPatients = patients.filter(p => p.villageId === vil.id);
      const vilPatientIds = new Set(vilPatients.map(p => p.id));
      const vilScreenings = screenings.filter(s => vilPatientIds.has(s.patientId));

      const screenedCount = new Set(vilScreenings.map(s => s.patientId)).size;
      const coverage = vil.adults > 0 ? Math.round((screenedCount / vil.adults) * 100) : 0;
      const highRisk = vilScreenings.filter(s => s.riskClassifications.overall === 'HIGH' || s.riskClassifications.overall === 'CRITICAL').length;
      const pendingFollows = vilScreenings.filter(s => s.status === 'reviewed' && s.followUpStatus === 'pending').length;

      return {
        id: vil.id,
        name: vil.name,
        population: vil.population,
        coverage,
        highRisk,
        pendingFollows
      };
    });
  }, [patients, screenings]);

  // Priority Visit List calculation
  const priorityVisitList = useMemo(() => {
    const visits: { patientId: string; patientName: string; villageName: string; risk: string; type: string; date: string; lastScreeningId: string }[] = [];

    patients.forEach(pat => {
      const patLogs = screenings.filter(s => s.patientId === pat.id);
      if (patLogs.length === 0) return;

      const sorted = [...patLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const latest = sorted[0];

      if (latest.status === 'reviewed' && latest.followUpStatus === 'pending') {
        visits.push({
          patientId: pat.id,
          patientName: pat.name,
          villageName: villageNames[pat.villageId || ''] || 'Rampur',
          risk: latest.riskClassifications.overall,
          type: latest.screeningType,
          date: latest.followUpDate ? new Date(latest.followUpDate).toLocaleDateString() : 'Today',
          lastScreeningId: latest.id
        });
      }
    });

    const riskRank: Record<string, number> = { 'CRITICAL': 0, 'HIGH': 1, 'MODERATE': 2, 'LOW': 3 };
    return visits.sort((a, b) => (riskRank[a.risk] ?? 3) - (riskRank[b.risk] ?? 3));
  }, [patients, screenings]);

  // Referral tracking progress list
  const referralsList = useMemo(() => {
    return screenings
      .filter(s => s.status === 'reviewed' && s.actionTaken === 'referred')
      .map(s => {
        let step = 2;
        if (s.followUpStatus === 'completed') {
          step = 4;
        } else if (s.followUpDate) {
          step = 3;
        }
        return {
          id: s.id,
          name: s.patientName,
          type: s.screeningType,
          step,
          date: new Date(s.createdAt).toLocaleDateString()
        };
      }).slice(0, 3);
  }, [screenings]);

  // CHW Monthly activity chart formatters
  const chwChartData = useMemo(() => {
    return [
      { name: 'Jan', screenings: 12 },
      { name: 'Feb', screenings: 18 },
      { name: 'Mar', screenings: 25 },
      { name: 'Apr', screenings: 30 },
      { name: 'May', screenings: 28 },
      { name: 'Jun', screenings: 35 },
      { name: 'Jul', screenings: screenings.length }
    ];
  }, [screenings]);

  const activeVisitPatientName = useMemo(() => {
    return patients.find(p => p.id === activeVisitPatientId)?.name || '';
  }, [activeVisitPatientId, patients]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-455 flex items-start gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-455 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header bar with Outreach Workspace switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans font-black">Outreach Operations Hub</h2>
          <p className="text-xs text-slate-400 mt-1">
            Conduct campaign screenings, manage prioritized patient home visits, and monitor village-level healthcare coverage.
          </p>
        </div>

        <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-white/5 w-fit font-sans text-[10px]">
          <button
            onClick={() => { setActiveTab('outreach'); resetForm(); }}
            className={`px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'outreach'
                ? 'bg-[#1e293b] text-cyan-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" /> Outreach Hub
          </button>
          <button
            onClick={() => { setActiveTab('new-screening'); resetForm(); }}
            className={`px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'new-screening'
                ? 'bg-[#1e293b] text-cyan-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" /> New Screening
          </button>
          <button
            onClick={() => { setActiveTab('history'); resetForm(); }}
            className={`px-3.5 py-2 font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#1e293b] text-emerald-450 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" /> Case History
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-sans text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2.5" /> Loading workspace records...
        </div>
      ) : activeTab === 'outreach' ? (
        /* ================= OUTREACH WORKSPACE TAB ================= */
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Performance / KPI cards grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 font-sans">
            <div className="glass-card p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Campaign Screened</span>
              <span className="text-2xl font-black block mt-2 text-cyan-400">{uniquePatients}</span>
              <span className="text-[9px] text-slate-455 block mt-1">{screenings.length} total logs</span>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Home Visits Logged</span>
              <span className="text-2xl font-black block mt-2 text-emerald-450">{screenings.filter(s => s.followUpStatus === 'completed').length}</span>
              <span className="text-[9px] text-slate-455 block mt-1">ASHA follow-ups</span>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">High Risk Caseload</span>
              <span className="text-2xl font-black block mt-2 text-rose-455">{highRiskCount}</span>
              <span className="text-[9px] text-slate-455 block mt-1">Critical status alerts</span>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Meds Distributed</span>
              <span className="text-2xl font-black block mt-2 text-cyan-400">85%</span>
              <span className="text-[9px] text-slate-455 block mt-1">Adherence tracker index</span>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Referral Success</span>
              <span className="text-2xl font-black block mt-2 text-emerald-450">92%</span>
              <span className="text-[9px] text-slate-455 block mt-1">Resolved care pathways</span>
            </div>
          </div>

          {/* Core Outreach dashboard layouts split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Workspace Panel: Daily Tasks & Priority Visits (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Daily Task List component */}
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2.5 flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-cyan-400" /> Daily Outreach checklist
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-350 block">Today's Visits</span>
                      <span className="text-[10px] text-slate-500">{priorityVisitList.length} patient checks pending</span>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">{priorityVisitList.length}</span>
                  </div>
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-350 block">Anemia Checks</span>
                      <span className="text-[10px] text-slate-500">Hb screenings required</span>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-455 flex items-center justify-center font-bold">1</span>
                  </div>
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-350 block">Meds Distribution</span>
                      <span className="text-[10px] text-slate-500">Outreach distribution packets</span>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-455 flex items-center justify-center font-bold">4</span>
                  </div>
                </div>
              </div>

              {/* Patient-Initiated Screening Requests Queue */}
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 font-sans text-xs">
                <div className="border-b border-white/5 pb-2.5 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-cyan-400" /> Community Screening Requests Queue
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">{screeningRequests.length} total requests</span>
                </div>

                {screeningRequests.length > 0 ? (
                  <div className="space-y-3">
                    {screeningRequests.map(req => {
                      const isPending = req.status === 'requested';
                      const isAccepted = req.status === 'accepted';
                      const isScheduled = req.status === 'scheduled';
                      const isResolved = req.status === 'completed';

                      return (
                        <div key={req.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3 hover:bg-white/[0.02] transition-colors text-left">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-slate-200 block">{req.patientName}</span>
                              <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                                Requested check: {req.screeningType} • Preferred: {req.preferredDate} ({req.preferredTime})
                              </span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              isPending 
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                                : isAccepted 
                                ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20' 
                                : isScheduled 
                                ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                                : 'bg-slate-850 text-slate-500 border border-white/5'
                            }`}>
                              {req.status}
                            </span>
                          </div>

                          {req.symptoms && (
                            <p className="text-[10px] text-slate-400 bg-slate-950/20 p-2 rounded-lg leading-relaxed">
                              <strong className="text-slate-350">Symptoms:</strong> {req.symptoms}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.02]">
                            {isPending && (
                              <button
                                onClick={() => handleAcceptRequest(req.id)}
                                className="px-3 py-1 bg-cyan-500 text-black font-bold rounded text-[10px] hover:bg-cyan-400"
                              >
                                Accept Request
                              </button>
                            )}

                            {isAccepted && (
                              <div className="w-full flex items-center gap-2">
                                {schedulingReqId === req.id ? (
                                  <div className="flex items-center gap-2 w-full">
                                    <input
                                      type="date"
                                      value={scheduleDate}
                                      onChange={(e) => setScheduleDate(e.target.value)}
                                      className="bg-[#0b1120] border border-white/5 rounded px-2.5 py-1 text-[10px] text-slate-250 outline-none"
                                    />
                                    <button
                                      onClick={() => handleSaveSchedule(req.id)}
                                      className="px-2.5 py-1 bg-emerald-500 text-black font-bold rounded text-[10px] hover:bg-emerald-400"
                                    >
                                      Save Date
                                    </button>
                                    <button
                                      onClick={() => setSchedulingReqId(null)}
                                      className="text-[9px] text-slate-500 hover:underline uppercase"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setSchedulingReqId(req.id)}
                                    className="px-3 py-1 bg-amber-500 text-black font-bold rounded text-[10px] hover:bg-amber-400"
                                  >
                                    Schedule Home Visit
                                  </button>
                                )}
                              </div>
                            )}

                            {isScheduled && (
                              <button
                                onClick={() => handleConductScreening(req)}
                                className="px-3 py-1 bg-emerald-500 text-black font-extrabold rounded text-[10px] hover:bg-emerald-450 border border-white/10"
                              >
                                Conduct Screening
                              </button>
                            )}

                            {isResolved && (
                              <span className="text-[10px] text-emerald-450 font-semibold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Screening Visit Completed
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-6 text-center">No community screening requests in queue.</p>
                )}
              </div>

              {/* Today's Prioritized Patient Visits list */}
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2.5">Today's Prioritized Patient Visits</h3>
                
                {priorityVisitList.length > 0 ? (
                  <div className="space-y-3">
                    {priorityVisitList.map(visit => {
                      const isCritical = visit.risk === 'CRITICAL';
                      const isHigh = visit.risk === 'HIGH';
                      const isModerate = visit.risk === 'MODERATE';
                      
                      const badgeColor = isCritical 
                        ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20 animate-pulse' 
                        : isHigh 
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        : isModerate 
                        ? 'bg-amber-500/10 text-amber-455 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20';

                      return (
                        <div key={visit.patientId} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-white/[0.02] transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200 text-xs">{visit.patientName}</span>
                              <span className="text-[9px] text-slate-555 font-mono">({visit.villageName})</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              Last check: {visit.type} • Target: {visit.date}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${badgeColor}`}>
                              {visit.risk} Risk
                            </span>
                            <button
                              onClick={() => {
                                setActiveVisitPatientId(visit.patientId);
                                setVisitMedTaken(true);
                                setVisitSymptoms('');
                                setVisitSystolic('');
                                setVisitDiastolic('');
                                setVisitSugar('');
                                setVisitHb('');
                              }}
                              className="px-2.5 py-1 bg-cyan-500 text-black rounded text-[10px] font-bold hover:bg-cyan-400 border border-white/10"
                            >
                              Start Visit
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-6 text-center">All scheduled home visits completed!</p>
                )}
              </div>

              {/* Home Visit Form Module (Visible when patient selected) */}
              {activeVisitPatientId && (
                <div className="glass-card p-5 rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.01] space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h4 className="text-xs font-bold text-cyan-400">Record Home Visit: <span className="font-black">{activeVisitPatientName}</span></h4>
                    <button
                      onClick={() => setActiveVisitPatientId(null)}
                      className="text-[10px] text-rose-455 hover:underline uppercase font-bold"
                    >
                      Cancel Visit
                    </button>
                  </div>

                  <form onSubmit={handleHomeVisitSubmit} className="space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Medicine compliance check */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Prescription Adherence</label>
                        <select
                          value={visitMedTaken ? 'yes' : 'no'}
                          onChange={(e) => setVisitMedTaken(e.target.value === 'yes')}
                          className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 px-3 text-slate-250 focus:outline-none"
                        >
                          <option value="yes">Medications Taken Daily</option>
                          <option value="no">Doses Missed / Non-adherent</option>
                        </select>
                      </div>

                      {/* Symptoms Log */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Observed Symptoms</label>
                        <input
                          type="text"
                          placeholder="e.g. none, minor dizziness, headache"
                          value={visitSymptoms}
                          onChange={(e) => setVisitSymptoms(e.target.value)}
                          className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 px-3 text-slate-250 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* BP Systolic */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">BP Systolic</label>
                        <input
                          type="number"
                          placeholder="120"
                          value={visitSystolic}
                          onChange={(e) => setVisitSystolic(e.target.value)}
                          className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 px-3 text-slate-250 focus:outline-none"
                        />
                      </div>

                      {/* BP Diastolic */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">BP Diastolic</label>
                        <input
                          type="number"
                          placeholder="80"
                          value={visitDiastolic}
                          onChange={(e) => setVisitDiastolic(e.target.value)}
                          className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 px-3 text-slate-250 focus:outline-none"
                        />
                      </div>

                      {/* Sugar / Glucose */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Glucose (mg/dL)</label>
                        <input
                          type="number"
                          placeholder="110"
                          value={visitSugar}
                          onChange={(e) => setVisitSugar(e.target.value)}
                          className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 px-3 text-slate-250 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Hemoglobin */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Hemoglobin Hb (Optional)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="11.5"
                          value={visitHb}
                          onChange={(e) => setVisitHb(e.target.value)}
                          className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 px-3 text-slate-250 focus:outline-none"
                        />
                      </div>

                      {/* Calendar Next Visit */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Next Visit Date</label>
                        <input
                          type="date"
                          value={visitNextDate}
                          onChange={(e) => setVisitNextDate(e.target.value)}
                          className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 px-3 text-slate-250 focus:outline-none text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">General Outreach Notes</label>
                      <textarea
                        rows={2}
                        placeholder="ASHA home outreach notes..."
                        value={visitNotes}
                        onChange={(e) => setVisitNotes(e.target.value)}
                        className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 px-3 text-slate-250 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-[#10b981] text-black font-extrabold rounded-lg hover:bg-emerald-450 border border-white/10"
                    >
                      {submitting ? 'Submitting Log...' : 'Submit Visit Log'}
                    </button>
                  </form>
                </div>
              )}

              {/* Village Health Summary table (Aggregated stats reuse) */}
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" /> Assigned Villages Coverage
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                        <th className="py-2.5">Village Name</th>
                        <th className="py-2.5">Population</th>
                        <th className="py-2.5 text-center font-bold text-cyan-400">Coverage %</th>
                        <th className="py-2.5 text-center">High Risk</th>
                        <th className="py-2.5 text-center">Pending Follows</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {villageOutreachStats.map(vil => (
                        <tr key={vil.id} className="hover:bg-white/[0.01]">
                          <td className="py-3 font-semibold text-slate-250">{vil.name}</td>
                          <td className="py-3 text-slate-400">{vil.population} villagers</td>
                          <td className="py-3 text-center font-mono font-bold text-cyan-400">{vil.coverage}%</td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${vil.highRisk > 0 ? 'bg-rose-500/10 text-rose-455' : 'bg-slate-800 text-slate-500'}`}>
                              {vil.highRisk}
                            </span>
                          </td>
                          <td className="py-3 text-center">{vil.pendingFollows} cases</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Workspace Panel: Performance, Stock, and Referrals (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* CHW Performance indicators bar chart */}
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-450" /> CHW Performance
                </h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chwChartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 10 }} />
                      <Bar dataKey="screenings" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <span className="text-[9px] text-slate-500 font-mono text-center block">Outreach Campaign Screenings logs by month</span>
              </div>

              {/* Medicine Distribution Tracker stock sheet */}
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-cyan-400" /> Medicine Tracker
                </h3>
                <div className="space-y-3 text-xs font-sans">
                  {medStocks.map(stock => {
                    const isDist = stock.status === 'Distributed';
                    const isPend = stock.status === 'Pending';
                    const tagClass = isDist 
                      ? 'bg-[#10b981]/15 text-emerald-450 border border-emerald-500/20' 
                      : isPend 
                      ? 'bg-amber-500/10 text-amber-455 border border-amber-500/20' 
                      : 'bg-rose-500/10 text-rose-455 border border-rose-500/20';

                    return (
                      <div key={stock.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-350">{stock.name}</span>
                          <button
                            onClick={() => toggleStockStatus(stock.id)}
                            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase font-mono ${tagClass}`}
                          >
                            {stock.status}
                          </button>
                        </div>
                        <span className="text-[9px] text-slate-500 block">Stock count: {stock.count} kits</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Referral Tracking */}
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2.5">Active Specialist Referrals</h3>
                
                {referralsList.length > 0 ? (
                  <div className="space-y-3 text-xs font-sans">
                    {referralsList.map(ref => (
                      <div key={ref.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200">{ref.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{ref.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[8px] font-mono text-slate-455 font-bold">
                          <span className={ref.step >= 1 ? 'text-cyan-400 font-bold' : ''}>Screened</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span className={ref.step >= 2 ? 'text-cyan-400 font-bold' : ''}>Reviewed</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span className={ref.step >= 3 ? 'text-cyan-400 font-bold' : ''}>Treatment</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span className={ref.step >= 4 ? 'text-[#10b981] font-bold' : ''}>Resolved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-4 text-center">No active outpatient referrals.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'new-screening' ? (
        /* ================= ORIGINAL NEW SCREENING FORM WORKFLOW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Left Panel: Form fields (8 columns) */}
          <div className="lg:col-span-8 glass-card p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-slate-200 border-b border-white/5 pb-3">Triage Intake Form</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Screening Type Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Screening Focus Area</label>
                <select
                  value={screeningType}
                  onChange={(e) => {
                    setScreeningType(e.target.value);
                    resetForm();
                  }}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2.5 px-3 text-xs text-slate-250 focus:outline-none"
                >
                  <option value="Hypertension/Diabetes">Hypertension & Diabetes</option>
                  <option value="Anemia">Maternal & Child Anemia</option>
                  <option value="Tuberculosis">Tuberculosis Symptoms</option>
                </select>
              </div>

              {/* Patient Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Patient</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search patient by name..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-250 focus:outline-none"
                    />
                  </div>
                </div>

                {patientSearch && (
                  <div className="bg-[#0b1120] border border-white/5 rounded-xl p-2 max-h-40 overflow-y-auto space-y-1">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPatientId(p.id);
                            setPatientSearch('');
                          }}
                          className={`w-full p-2.5 rounded-lg text-left text-xs flex justify-between items-center transition-all ${
                            selectedPatientId === p.id 
                              ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
                              : 'hover:bg-white/[0.02] text-slate-350'
                          }`}
                        >
                          <span className="font-semibold">{p.name} {p.villageId ? `(${p.villageId === 'vil_01' ? 'Rampur' : p.villageId === 'vil_02' ? 'Lakshmipur' : 'Devgaon'})` : ''}</span>
                          <span className="text-[9px] text-slate-550 font-mono">{p.id}</span>
                        </button>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-505 p-2 italic text-center">No patients found</p>
                    )}
                  </div>
                )}

                {selectedPatient && (
                  <div className="p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/10 flex items-center justify-between text-xs text-cyan-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div>
                        <span className="font-bold">{selectedPatient.name}</span>
                        <span className="text-[10px] text-slate-500 ml-2">ID: {selectedPatient.id} • Village: {selectedPatient.villageId === 'vil_01' ? 'Rampur' : selectedPatient.villageId === 'vil_02' ? 'Lakshmipur' : selectedPatient.villageId === 'vil_03' ? 'Devgaon' : 'Rampur'}</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSelectedPatientId('')}
                      className="text-[9px] font-bold text-rose-455 hover:underline uppercase"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>

              {/* Hypertension / Diabetes Inputs */}
              {screeningType === 'Hypertension/Diabetes' && (
                <div className="space-y-4 pt-2 animate-fadeIn text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Systolic BP (mmHg)</label>
                      <input
                        type="number"
                        placeholder="e.g., 120"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                        className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2.5 px-3 text-slate-250 focus:outline-none"
                      />
                      {bpWarning && <p className="text-[10px] text-rose-450">{bpWarning}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Diastolic BP (mmHg)</label>
                      <input
                        type="number"
                        placeholder="e.g., 80"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2.5 px-3 text-slate-250 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Blood Sugar (mg/dL)</label>
                      <input
                        type="number"
                        placeholder="e.g., 110"
                        value={bloodSugar}
                        onChange={(e) => setBloodSugar(e.target.value)}
                        className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2.5 px-3 text-slate-250 focus:outline-none"
                      />
                      {bsWarning && <p className="text-[10px] text-rose-450">{bsWarning}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Glucose test type</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setBloodSugarType('random')}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                            bloodSugarType === 'random' 
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                              : 'bg-[#0b1120] text-slate-400 border-white/5 hover:bg-white/[0.02]'
                          }`}
                        >
                          Random Glucose
                        </button>
                        <button
                          type="button"
                          onClick={() => setBloodSugarType('fasting')}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                            bloodSugarType === 'fasting' 
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                              : 'bg-[#0b1120] text-slate-400 border-white/5 hover:bg-white/[0.02]'
                          }`}
                        >
                          Fasting Glucose
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Maternal & Child Anemia Inputs */}
              {screeningType === 'Anemia' && (
                <div className="space-y-4 pt-2 animate-fadeIn text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hemoglobin Level (g/dL)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 11.5"
                        value={hemoglobin}
                        onChange={(e) => setHemoglobin(e.target.value)}
                        className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2.5 px-3 text-slate-250 focus:outline-none"
                      />
                      {hemoWarning && <p className="text-[10px] text-rose-450">{hemoWarning}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Body Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 55.4"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2.5 px-3 text-slate-250 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Patient Age Cohort</label>
                      <div className="flex gap-2">
                        {['child', 'adolescent', 'adult'].map(cohort => (
                          <button
                            key={cohort}
                            type="button"
                            onClick={() => setAgeGroup(cohort as any)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border capitalize transition-all ${
                              ageGroup === cohort 
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                                : 'bg-[#0b1120] text-slate-400 border-white/5 hover:bg-white/[0.02]'
                            }`}
                          >
                            {cohort}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gestational status</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setIsPregnant(false); setTrimester(''); }}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                            !isPregnant 
                              ? 'bg-[#10b981]/10 text-emerald-450 border-[#10b981]/20' 
                              : 'bg-[#0b1120] text-slate-400 border-white/5 hover:bg-white/[0.02]'
                          }`}
                        >
                          Non-Pregnant
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPregnant(true)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                            isPregnant 
                              ? 'bg-rose-500/10 text-rose-455 border-rose-500/20' 
                              : 'bg-[#0b1120] text-slate-400 border-white/5 hover:bg-white/[0.02]'
                          }`}
                        >
                          Active Pregnancy
                        </button>
                      </div>
                    </div>
                  </div>

                  {isPregnant && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pregnancy Trimester (1-3)</label>
                        <input
                          type="number"
                          min="1"
                          max="3"
                          placeholder="e.g. 2"
                          value={trimester}
                          onChange={(e) => setTrimester(e.target.value)}
                          className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2.5 px-3 text-slate-250 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 flex flex-col justify-end">
                        <button
                          type="button"
                          onClick={() => setIfaStarted(!ifaStarted)}
                          className={`w-full py-2.5 rounded-lg text-xs font-bold border transition-all ${
                            ifaStarted 
                              ? 'bg-emerald-500/10 text-emerald-455 border-emerald-500/20' 
                              : 'bg-[#0b1120] text-slate-400 border-white/5 hover:bg-white/[0.02]'
                          }`}
                        >
                          {ifaStarted ? 'Iron (IFA) Tablets Prescribed' : 'IFA Tablets Not Prescribed'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tuberculosis Symptom checklist */}
              {screeningType === 'Tuberculosis' && (
                <div className="space-y-3.5 pt-2 animate-fadeIn text-xs">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Observed Tuberculosis Symptoms</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { state: cough, setState: setCough, label: 'Chronic Cough (> 2 weeks)' },
                      { state: fever, setState: setFever, label: 'Unexplained Fever' },
                      { state: nightSweats, setState: setNightSweats, label: 'Recurrent Night Sweats' },
                      { state: weightLoss, setState: setWeightLoss, label: 'Unexplained Weight Loss' }
                    ].map((sym, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => sym.setState(!sym.state)}
                        className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                          sym.state 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-455 font-bold' 
                            : 'bg-[#0b1120] border-white/5 hover:bg-white/[0.02] text-slate-400'
                        }`}
                      >
                        <span>{sym.label}</span>
                        {sym.state ? <CheckSquare className="w-4 h-4 text-rose-450" /> : <Square className="w-4 h-4 text-slate-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-cyan-500 text-black rounded-lg text-xs font-bold hover:bg-cyan-400 cursor-pointer disabled:opacity-40 border border-white/10"
              >
                {submitting ? 'Submitting Vitals Record...' : 'Submit Triage Case File'}
              </button>
            </form>
          </div>

          {/* Right Panel: Rules Engine & Guidelines Info (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4 font-sans">
              <h4 className="text-[10px] font-bold text-slate-355 uppercase tracking-wider border-b border-white/5 pb-2">Live WHO Triage Assessment</h4>
              
              {selectedPatient ? (
                <div className="space-y-4 text-xs">
                  {screeningType === 'Hypertension/Diabetes' && systolic && diastolic && bloodSugar ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Hypertension Class</span>
                        <span className="font-bold text-slate-200 mt-1 block">
                          {RiskEngine.calculateRisk('Hypertension/Diabetes', { systolic: parseInt(systolic, 10), diastolic: parseInt(diastolic, 10), bloodSugar: parseInt(bloodSugar, 10), bloodSugarType }).riskClassifications.hypertension}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Diabetes Class</span>
                        <span className="font-bold text-slate-200 mt-1 block">
                          {RiskEngine.calculateRisk('Hypertension/Diabetes', { systolic: parseInt(systolic, 10), diastolic: parseInt(diastolic, 10), bloodSugar: parseInt(bloodSugar, 10), bloodSugarType }).riskClassifications.diabetes}
                        </span>
                      </div>
                      <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                        <span className="text-[9px] text-slate-550 uppercase tracking-wider block font-bold font-sans">Overall Caseload Risk</span>
                        <span className="font-black text-rose-455 text-sm uppercase block mt-1">
                          {RiskEngine.calculateRisk('Hypertension/Diabetes', { systolic: parseInt(systolic, 10), diastolic: parseInt(diastolic, 10), bloodSugar: parseInt(bloodSugar, 10), bloodSugarType }).riskClassifications.overall}
                        </span>
                      </div>
                    </div>
                  ) : screeningType === 'Anemia' && hemoglobin ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Anemia severity</span>
                        <span className="font-bold text-slate-200 mt-1 block">
                          {RiskEngine.calculateRisk('Anemia', { hemoglobin: parseFloat(hemoglobin), ageGroup, isPregnant, trimester: trimester ? parseInt(trimester, 10) : undefined }).riskClassifications.anemia}
                        </span>
                      </div>
                      <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                        <span className="text-[9px] text-slate-550 uppercase tracking-wider block font-bold font-sans">Overall Caseload Risk</span>
                        <span className="font-black text-orange-400 text-sm uppercase block mt-1">
                          {RiskEngine.calculateRisk('Anemia', { hemoglobin: parseFloat(hemoglobin), ageGroup, isPregnant, trimester: trimester ? parseInt(trimester, 10) : undefined }).riskClassifications.overall}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">Enter vitals to calculate risk level.</p>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 italic">Select a patient profile to enable live rules engine.</p>
              )}
            </div>

            {/* Diagnostics guidelines criteria list */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-2">Triage Diagnostic Guideline</h4>
              <div className="space-y-2 text-[10px] text-slate-550 font-mono leading-relaxed">
                <p className="text-slate-400"><strong className="text-slate-350">Hypertension Criteria:</strong><br/>Normal: &lt;120/80 mmHg<br/>Stage 1: 140-159 / 90-99 mmHg<br/>Stage 2: 160+ / 100+ mmHg<br/>Crisis: 180+ / 110+ mmHg</p>
                <p className="text-slate-400 mt-2"><strong className="text-slate-355">Diabetes Criteria Fasting/Random:</strong><br/>Normal: &lt;100 / &lt;140 mg/dL<br/>Prediabetes: 100-125 / 140-199 mg/dL<br/>Diabetes: 126+ / 200+ mg/dL</p>
                <p className="text-slate-400 mt-2"><strong className="text-slate-355">Anemia WHO Criteria (Hb g/dL):</strong><br/>Pregnant / Child: Normal 11+, Mild 10-10.9, Moderate 7-9.9, Severe &lt;7<br/>Adolescent: Normal 11.5+, Mild 11-11.4, Moderate 8-10.9, Severe &lt;8<br/>Adult: Normal 12+, Mild 11-11.9, Moderate 8-10.9, Severe &lt;8</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= ORIGINAL SCREENING HISTORY LOG entries VIEW ================= */
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 font-sans">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Screening Log Entries</h3>
            <span className="text-[10px] text-slate-500 font-mono">{screenings.length} total records</span>
          </div>

          {screenings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Screening Type</th>
                    <th className="py-3 px-4">Triage Readings</th>
                    <th className="py-3 px-4">Calculated Risk</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Directives & Notes</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-350">
                  {screenings.map(s => {
                    return (
                      <tr key={s.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-200">{s.patientName}</span>
                          <span className="block text-[9px] text-slate-550 font-mono mt-0.5">{s.patientId}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-400">{s.screeningType}</td>
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-300">
                          {s.screeningType === 'Hypertension/Diabetes' ? (
                            <>
                              BP: {s.readings.systolic}/{s.readings.diastolic} mmHg<br/>
                              BS: {s.readings.bloodSugar} mg/dL ({s.readings.bloodSugarType})
                            </>
                          ) : s.screeningType === 'Anemia' ? (
                            <>Hemoglobin: {s.readings.hemoglobin} g/dL</>
                          ) : (
                            <>Symptoms: {s.readings.tbSymptoms?.join(', ') || 'None'}</>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${
                            s.riskClassifications.overall === 'CRITICAL'
                              ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20 animate-pulse'
                              : s.riskClassifications.overall === 'HIGH'
                              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                              : s.riskClassifications.overall === 'MODERATE'
                              ? 'bg-amber-500/10 text-amber-455 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20'
                          }`}>
                            {s.riskClassifications.overall}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            s.status === 'reviewed' 
                              ? 'bg-[#10b981]/15 text-emerald-450 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-455 border border-amber-500/20'
                          }`}>
                            {s.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate">
                          {s.status === 'reviewed' ? (
                            <div>
                              <p className="text-slate-400 italic font-sans">"{s.doctorNotes}"</p>
                              {s.followUpDate && (
                                <span className="block text-[9px] text-cyan-400 font-mono font-bold mt-1">
                                  Follow-up: {new Date(s.followUpDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-555 italic font-mono">Awaiting provider review</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 italic text-xs">
              No screenings have been conducted in this clinic session yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChwDashboard;
