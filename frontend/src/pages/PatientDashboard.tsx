import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, Activity, Bot, Send, Calendar, Stethoscope, 
  AlertTriangle, BookOpen, Clock, CheckCircle2, TrendingUp, HelpCircle,
  ClipboardCheck, Clock3, UserCheck, CheckCircle, Check
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';
import { useAppMode } from '../context/AppModeContext';
import { CardSkeleton } from '../components/common/Loader';
import aiService from '../services/aiService';
import screeningService from '../services/screeningService';
import { Screening } from '../types';
import { PatientTimeline } from '../components/screening/PatientTimeline';
import { MedicationTickOff } from '../components/widgets/HealthWidgets';

export const PatientDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const { mode } = useAppMode();
  const [loading, setLoading] = useState(true);
  const [screenings, setScreenings] = useState<Screening[]>([]);

  // Screening requests state
  const [requests, setRequests] = useState<any[]>([]);
  const [reqType, setReqType] = useState('Blood Pressure Screening');
  const [reqSymptoms, setReqSymptoms] = useState('');
  const [reqDate, setReqDate] = useState('');
  const [reqTime, setReqTime] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [reqSuccess, setReqSuccess] = useState<string | null>(null);

  // AI Health Assistant chat state
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: `Hello ${currentUser.name}! I am your MEDIBRIDGE Health Companion. I can help explain your diagnostic screenings, doctor advice, or recommend wellness tips. How can I support you today?` }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchScreeningsAndRequests = async () => {
    try {
      const data = await screeningService.getScreenings();
      setScreenings(data.filter(s => s.patientId === currentUser.id));

      const rawReq = localStorage.getItem('demo_db_screening_requests');
      if (rawReq) {
        const list = JSON.parse(rawReq);
        setRequests(list.filter((r: any) => r.patientId === currentUser.id));
      }
    } catch (err) {
      console.error('Failed to load patient workspace:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 950);
    fetchScreeningsAndRequests();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    const handleDemoRefresh = () => {
      fetchScreeningsAndRequests();
    };
    window.addEventListener('medibridge-demo-refresh', handleDemoRefresh);
    return () => window.removeEventListener('medibridge-demo-refresh', handleDemoRefresh);
  }, []);

  // Submit Patient screening request
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDate = reqDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]; // Tomorrow
    const finalTime = reqTime || '10:00 AM';

    const newReq = {
      id: `req_${Date.now()}`,
      patientId: currentUser.id,
      patientName: currentUser.name,
      villageId: currentUser.villageId || 'vil_01',
      screeningType: reqType,
      symptoms: reqSymptoms,
      preferredDate: finalDate,
      preferredTime: finalTime,
      notes: reqNotes,
      status: 'requested',
      assignedChwId: '',
      assignedChwName: '',
      createdAt: new Date().toISOString()
    };

    const raw = localStorage.getItem('demo_db_screening_requests') || '[]';
    const list = JSON.parse(raw);
    list.unshift(newReq);
    localStorage.setItem('demo_db_screening_requests', JSON.stringify(list));

    setReqSuccess(`Your community screening request is submitted successfully! Ramesh Kumar (your local ASHA worker) has received your request on their Outreach Dashboard and will schedule your home visit shortly.`);
    setReqSymptoms('');
    setReqDate('');
    setReqTime('');
    setReqNotes('');

    fetchScreeningsAndRequests();
    window.dispatchEvent(new Event('medibridge-demo-refresh'));

    setTimeout(() => setReqSuccess(null), 8000);
  };

  // Chronological screenings logs
  const sortedScreenings = useMemo(() => {
    return [...screenings].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [screenings]);

  const latestScreening = useMemo(() => {
    if (sortedScreenings.length === 0) return null;
    return sortedScreenings[sortedScreenings.length - 1];
  }, [sortedScreenings]);

  // Active or latest screening request details
  const activeRequest = useMemo(() => {
    if (requests.length === 0) return null;
    // Sort descending by createdAt to fetch newest
    return [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }, [requests]);

  // Compute Overall Health Status & Diagnoses
  const summaryData = useMemo(() => {
    if (!latestScreening) {
      return {
        status: 'Healthy',
        statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        diagnoses: ['No diagnosed conditions'],
        reviewingDoctor: 'Not assigned',
        lastScreening: 'N/A',
        nextFollowup: 'N/A',
        overallRisk: 'LOW',
        isCritical: false
      };
    }

    const overallRisk = latestScreening.riskClassifications.overall;
    let status = 'Healthy';
    let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

    if (overallRisk === 'CRITICAL') {
      status = 'High Risk';
      statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse';
    } else if (overallRisk === 'HIGH' || overallRisk === 'MODERATE') {
      status = 'Under Observation';
      statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }

    const diagnoses: string[] = [];
    const hasAnemia = sortedScreenings.some(s => s.screeningType === 'Anemia' && s.riskClassifications.anemia && s.riskClassifications.anemia !== 'Normal');
    const hasBP = sortedScreenings.some(s => s.screeningType === 'Hypertension/Diabetes' && s.riskClassifications.hypertension && s.riskClassifications.hypertension !== 'Normal');
    const hasDiabetes = sortedScreenings.some(s => s.screeningType === 'Hypertension/Diabetes' && s.riskClassifications.diabetes && s.riskClassifications.diabetes !== 'Normal');

    if (hasBP) diagnoses.push('High Blood Pressure');
    if (hasDiabetes) diagnoses.push('Diabetes');
    if (hasAnemia) diagnoses.push('Maternal/Child Anemia');
    if (diagnoses.length === 0) diagnoses.push('General Checkup');

    const reviewingDoctor = latestScreening.doctorName || 'Community Health Worker';
    const lastScreening = new Date(latestScreening.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    const nextFollowup = latestScreening.followUpDate 
      ? new Date(latestScreening.followUpDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
      : 'TBD';

    return {
      status,
      statusColor,
      diagnoses,
      reviewingDoctor,
      lastScreening,
      nextFollowup,
      overallRisk,
      isCritical: overallRisk === 'CRITICAL'
    };
  }, [latestScreening, sortedScreenings]);

  // Compute Separate Conditions Telemetry
  const conditionsData = useMemo(() => {
    const data = {
      bp: null as any,
      diabetes: null as any,
      anemia: null as any
    };

    const bpLogs = sortedScreenings.filter(s => s.screeningType === 'Hypertension/Diabetes' && s.readings.systolic !== undefined);
    if (bpLogs.length > 0) {
      const latest = bpLogs[bpLogs.length - 1];
      const prev = bpLogs.length > 1 ? bpLogs[bpLogs.length - 2] : null;
      let trend = 'Stable';
      let trendColor = 'text-slate-400';

      if (prev) {
        const diff = latest.readings.systolic! - prev.readings.systolic!;
        if (diff < -4) {
          trend = `Improving (Dropped by ${Math.abs(diff)} mmHg)`;
          trendColor = 'text-emerald-400';
        } else if (diff > 4) {
          trend = `Needs Review (Rose by ${diff} mmHg)`;
          trendColor = 'text-rose-400';
        }
      }

      const severityMap: Record<string, string> = {
        'Normal': 'Normal blood pressure',
        'Prehypertension': 'Elevated Blood Pressure (Prehypertension)',
        'Stage 1': 'Mild High Blood Pressure (Stage 1)',
        'Stage 2': 'Moderate High Blood Pressure (Stage 2)',
        'Crisis': 'Severe Blood Pressure Crisis (Immediate Action)'
      };

      data.bp = {
        value: `${latest.readings.systolic}/${latest.readings.diastolic} mmHg`,
        severity: severityMap[latest.riskClassifications.hypertension || 'Normal'] || 'Normal blood pressure',
        trend,
        trendColor,
        doctor: latest.doctorName || 'Pending Clinician Review',
        advice: latest.doctorNotes || 'Maintain low sodium intake and take prescribed medicines daily.',
        nextReview: latest.followUpDate ? new Date(latest.followUpDate).toLocaleDateString() : 'To be scheduled'
      };
    }

    const sugarLogs = sortedScreenings.filter(s => s.screeningType === 'Hypertension/Diabetes' && s.readings.bloodSugar !== undefined);
    if (sugarLogs.length > 0) {
      const latest = sugarLogs[sugarLogs.length - 1];
      const prev = sugarLogs.length > 1 ? sugarLogs[sugarLogs.length - 2] : null;
      let trend = 'Stable';
      let trendColor = 'text-slate-400';

      if (prev) {
        const diff = latest.readings.bloodSugar! - prev.readings.bloodSugar!;
        if (diff < -10) {
          trend = `Improving (Dropped by ${Math.abs(diff)} mg/dL)`;
          trendColor = 'text-emerald-400';
        } else if (diff > 10) {
          trend = `Needs Review (Rose by ${diff} mg/dL)`;
          trendColor = 'text-rose-400';
        }
      }

      const severityMap: Record<string, string> = {
        'Normal': 'Normal glucose range',
        'Prediabetes': 'Borderline sugar levels (Prediabetes)',
        'Diabetes': 'Active Diabetes Range'
      };

      data.diabetes = {
        value: `${latest.readings.bloodSugar} mg/dL (${latest.readings.bloodSugarType || 'random'})`,
        severity: severityMap[latest.riskClassifications.diabetes || 'Normal'] || 'Normal glucose range',
        trend,
        trendColor,
        advice: latest.doctorNotes || 'Follow a balanced, low-sugar diet and monitor glucose regularly.'
      };
    }

    const anemiaLogs = sortedScreenings.filter(s => s.screeningType === 'Anemia' && s.readings.hemoglobin !== undefined);
    if (anemiaLogs.length > 0) {
      const latest = anemiaLogs[anemiaLogs.length - 1];
      const prev = anemiaLogs.length > 1 ? anemiaLogs[anemiaLogs.length - 2] : null;
      let trend = 'Stable';
      let trendColor = 'text-slate-400';

      if (prev) {
        const diff = latest.readings.hemoglobin! - prev.readings.hemoglobin!;
        if (diff > 0.4) {
          trend = `Improving (Hb rose by +${diff.toFixed(1)} g/dL)`;
          trendColor = 'text-emerald-400';
        } else if (diff < -0.4) {
          trend = `Needs Review (Hb dropped by ${diff.toFixed(1)} g/dL)`;
          trendColor = 'text-rose-400';
        }
      }

      data.anemia = {
        value: `${latest.readings.hemoglobin} g/dL`,
        severity: `${latest.riskClassifications.anemia || 'Normal'} Anemia Severity`,
        trend,
        trendColor,
        ifaStatus: latest.readings.ifaStarted ? 'Iron (IFA) Tablets Started' : 'Not started',
        advice: latest.doctorNotes || 'Consume iron-rich foods (spinach, jaggery) and take Vitamin C to aid absorption.',
        doctor: latest.doctorName || 'Clinician'
      };
    }

    return data;
  }, [sortedScreenings]);

  // Compute Doctor's Advice Summary
  const adviceData = useMemo(() => {
    if (!latestScreening) {
      return {
        medication: 'No prescribed medicines',
        lifestyle: 'Regular daily walking, 7-8 hours sleep, stress reduction.',
        diet: 'Balanced home-cooked meals, plenty of clean drinking water.',
        exercise: '30 mins of light activity (walking, yoga) daily.',
        reminder: 'N/A'
      };
    }

    const note = latestScreening.doctorNotes || '';
    let medication = latestScreening.actionTaken === 'medication' ? 'Prescribed clinical medications started.' : 'Under observation (no active medicines)';
    let lifestyle = 'Avoid stress, maintain regular sleep patterns, avoid tobacco/alcohol.';
    let diet = 'Drink plenty of water. Reduce processed food and carbonated drinks.';
    let exercise = '30 minutes of mild physical exercises (brisk walking) daily.';

    if (latestScreening.screeningType === 'Anemia') {
      medication = latestScreening.readings.ifaStarted ? 'Iron (IFA) tablets taken daily' : 'Dietary iron supplementation';
      diet = 'Iron-rich foods (leafy green vegetables, beans, nuts) and Vitamin C (citrus fruits) for absorption.';
      lifestyle = 'Take iron pills with water or juice on an empty stomach unless advised otherwise. Do not take with tea/coffee.';
    } else if (latestScreening.screeningType === 'Hypertension/Diabetes') {
      diet = 'Low-sodium (reduce salt), low-fat foods. Avoid refined sugars and white bread.';
      lifestyle = 'Monitor blood pressure and blood sugar regularly. Keep record sheets.';
    }

    if (note) {
      lifestyle = `${note}. ${lifestyle}`;
    }

    const reminder = latestScreening.followUpDate
      ? `Next check-up scheduled on ${new Date(latestScreening.followUpDate).toLocaleDateString()}`
      : 'Maintain active monitoring. Next date will be updated soon.';

    return {
      medication,
      lifestyle,
      diet,
      exercise,
      reminder
    };
  }, [latestScreening]);

  // Recharts Progress Data Formatters
  const progressChartData = useMemo(() => {
    return sortedScreenings.map(s => {
      const dateStr = new Date(s.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      return {
        date: dateStr,
        hb: s.readings.hemoglobin || null,
        bp: s.readings.systolic || null,
        sugar: s.readings.bloodSugar || null
      };
    });
  }, [sortedScreenings]);

  // Determine General Health Progress Level
  const progressStatus = useMemo(() => {
    if (!latestScreening) return { label: 'Stable', color: 'text-slate-400 bg-slate-900/60' };
    
    const risk = latestScreening.riskClassifications.overall;
    if (risk === 'CRITICAL') {
      return { label: 'Needs Review', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse' };
    }
    
    if (sortedScreenings.length > 1) {
      const riskOrder = { 'LOW': 0, 'MODERATE': 1, 'HIGH': 2, 'CRITICAL': 3 };
      const oldestRisk = riskOrder[sortedScreenings[0].riskClassifications.overall || 'LOW'];
      const newestRisk = riskOrder[risk];
      if (newestRisk < oldestRisk) {
        return { label: 'Improving', color: 'text-emerald-450 bg-emerald-500/10 border-emerald-500/20' };
      }
    }
    return { label: 'Stable', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
  }, [latestScreening, sortedScreenings]);

  // Suggested Prompts
  const suggestedPrompts = useMemo(() => {
    const prompts = ['Explain my general health status.', 'What foods should I eat to stay healthy?'];
    if (conditionsData.bp) {
      prompts.push('Explain my blood pressure levels.', 'How can I lower my blood pressure naturally?');
    }
    if (conditionsData.diabetes) {
      prompts.push('How can I reduce my blood sugar?', 'What is diabetes?');
    }
    if (conditionsData.anemia) {
      prompts.push('Why do I have anemia?', 'How does iron help my blood?');
    }
    return prompts.slice(0, 4);
  }, [conditionsData]);

  const handleAskAI = async (promptText: string) => {
    setInputText(promptText);
    const userMsg = { sender: 'user' as const, text: promptText };
    setMessages(prev => [...prev, userMsg]);
    
    setAiLoading(true);
    try {
      const response = await aiService.analyzeSymptoms(promptText);
      const botMsg = { sender: 'bot' as const, text: response.summary };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const botMsg = { sender: 'bot' as const, text: 'I am sorry, the AI companion is experiencing high volume right now. Let me review your case logs again.' };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setAiLoading(false);
      setInputText('');
    }
  };

  const handleSendCustomMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await handleAskAI(inputText);
  };

  // Request stepper step mapping
  const activeRequestStep = useMemo(() => {
    if (!activeRequest) return 0;
    const stages: Record<string, number> = {
      'requested': 1,
      'accepted': 2,
      'scheduled': 3,
      'screened': 4,
      'reviewing': 5,
      'treatment': 6,
      'completed': 7
    };
    return stages[activeRequest.status] || 1;
  }, [activeRequest]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-left">
      {/* Emergency Alert Banner */}
      {summaryData.isCritical && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-start gap-3 text-xs text-rose-450 animate-pulse animate-fadeIn">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-450" />
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-[10px]">⚠️ Emergency Warning Alert</h4>
            <p className="font-sans leading-relaxed text-slate-355">
              Immediate medical consultation is highly recommended. Your latest diagnostic screening logs show critical risk readings. Please visit the nearest Primary Health Center (PHC) or hospital immediately.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans">My Health Companion</h2>
          <p className="text-xs text-slate-400 mt-1">Simple and patient-friendly guidelines to trace your medical history, recommendations, and vitals progress.</p>
        </div>
      </div>

      {/* Row 1: Summary & Medication adherence checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MY HEALTH SUMMARY (2 Cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="border-b border-white/5 pb-2.5">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-sans flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-cyan-400" /> My Health Summary
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Health Status</span>
                <span className={`inline-block ml-3 px-2 py-0.5 rounded text-[9px] font-mono border font-extrabold ${summaryData.statusColor}`}>
                  {summaryData.status}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Diagnosed Conditions</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {summaryData.diagnoses.map((d, i) => (
                    <span key={i} className="text-[9px] bg-slate-800 text-slate-350 border border-white/5 px-2.5 py-0.5 rounded-full font-bold">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Reviewing Clinician</span>
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mt-1">
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-455" /> {summaryData.reviewingDoctor}
                </span>
              </div>
            </div>

            <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Last Screening Campaign</span>
                <span className="text-xs font-semibold text-slate-250 flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-455" /> {summaryData.lastScreening}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Next Scheduled Follow-up</span>
                <span className="text-xs font-semibold text-emerald-450 flex items-center gap-1.5 mt-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> {summaryData.nextFollowup}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Triage Severity Class</span>
                <span className="text-xs font-mono font-bold text-slate-350 uppercase block mt-1">{summaryData.overallRisk} LEVEL RISK</span>
              </div>
            </div>
          </div>
        </div>

        {/* MEDICATION TRACKER (1 Col) */}
        <div className="lg:col-span-1">
          <MedicationTickOff patientId={currentUser.id} />
        </div>
      </div>

      {/* Row 2: Community Health Services (Form & Tracker Stepper) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Tracker Stepper (Left) */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-2.5">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-sans flex items-center gap-2">
                <Clock3 className="w-4.5 h-4.5 text-cyan-400" /> Upcoming Home Visit Tracker
              </h3>
            </div>

            {activeRequest ? (
              <div className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Expected Screening</span>
                    <span className="font-bold text-slate-200 mt-1 block">{activeRequest.screeningType}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Assigned ASHA Worker</span>
                    <span className="font-bold text-slate-200 mt-1 block flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-455" /> {activeRequest.assignedChwName || 'Awaiting assignment'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Scheduled Visit Date</span>
                    <span className="font-bold text-emerald-450 mt-1 block">
                      {activeRequest.scheduledVisitDate ? new Date(activeRequest.scheduledVisitDate).toLocaleDateString() : 'Pending Scheduling'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Visit Status</span>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[9px] font-mono border font-extrabold uppercase bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                      {activeRequest.status}
                    </span>
                  </div>
                </div>

                {/* Horizontal Progress Stepper */}
                <div className="space-y-3 pt-4 border-t border-white/[0.03]">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Care Request Steps</span>
                  <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 mt-2">
                    {[
                      { step: 1, label: 'Requested' },
                      { step: 2, label: 'Accepted' },
                      { step: 3, label: 'Scheduled' },
                      { step: 4, label: 'Screened' },
                      { step: 5, label: 'Reviewing' },
                      { step: 6, label: 'Treatment' },
                      { step: 7, label: 'Completed' }
                    ].map(st => {
                      const isActive = activeRequestStep >= st.step;
                      return (
                        <div key={st.step} className="flex flex-col items-center gap-1.5 flex-1 relative">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border font-bold text-[9px] transition-all ${
                            isActive 
                              ? 'bg-cyan-500 text-black border-cyan-450 shadow-glow-cyan' 
                              : 'bg-[#0f172a] border-white/10 text-slate-600'
                          }`}>
                            {activeRequestStep > st.step ? <Check className="w-2.5 h-2.5" /> : st.step}
                          </div>
                          <span className={`text-[8px] uppercase tracking-wider font-semibold transition-colors ${
                            isActive ? 'text-cyan-400' : 'text-slate-550'
                          }`}>
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 italic text-xs">
                No upcoming home health visits requested yet. Use the Request form to schedule a CHW screening.
              </div>
            )}
          </div>
          {activeRequest && (
            <div className="p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/10 text-[9px] text-slate-400 font-mono">
              ASHA workers conduct door-to-door screenings based on NCD parameters.
            </div>
          )}
        </div>

        {/* Request Submission Form (Right) */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="border-b border-white/5 pb-2.5">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-sans flex items-center gap-2">
              <ClipboardCheck className="w-4.5 h-4.5 text-cyan-400" /> Request Community Screening
            </h3>
          </div>

          {reqSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-[10px] rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{reqSuccess}</span>
            </div>
          )}

          <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Screening Service Requested</label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value)}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 px-3 text-slate-250 focus:outline-none"
                >
                  <option value="Blood Pressure Screening">Blood Pressure Check</option>
                  <option value="Diabetes Screening">Blood Glucose (Diabetes) Check</option>
                  <option value="Anemia Screening">Maternal & Child Anemia Hb check</option>
                  <option value="General Health Check">General NCD Health Check</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Observed Symptoms (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. headaches, fatigue, dizziness"
                  value={reqSymptoms}
                  onChange={(e) => setReqSymptoms(e.target.value)}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 px-3 text-slate-250 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Preferred Visit Date</label>
                <input
                  type="date"
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 px-3 text-slate-250 focus:outline-none text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Preferred Time Slot</label>
                <input
                  type="time"
                  value={reqTime}
                  onChange={(e) => setReqTime(e.target.value)}
                  className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 px-3 text-slate-250 focus:outline-none text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Additional Directives & Notes</label>
              <textarea
                rows={2}
                placeholder="Include any specific medical history or requests..."
                value={reqNotes}
                onChange={(e) => setReqNotes(e.target.value)}
                className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 px-3 text-slate-250 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 text-black font-extrabold rounded-lg hover:bg-cyan-400 border border-white/10"
            >
              Request Home Health Visit
            </button>
          </form>
        </div>
      </div>

      {/* Row 3: Condition Details & Doctor Recommendations advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MY CONDITIONS (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="border-b border-white/5 pb-2.5">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-sans flex items-center gap-2">
                <Heart className="w-4.5 h-4.5 text-rose-500 animate-pulse" /> My Conditions Overview
              </h3>
            </div>

            <div className="space-y-4.5 pt-2">
              {conditionsData.bp ? (
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-slate-200">High Blood Pressure (Hypertension)</span>
                    <span className={`text-[9px] font-mono font-bold uppercase ${conditionsData.bp.trendColor}`}>
                      {conditionsData.bp.trend}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Latest BP Reading</span>
                      <span className="font-bold text-slate-200 block mt-0.5">{conditionsData.bp.value}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Status Class</span>
                      <span className="font-bold text-slate-200 block mt-0.5">{conditionsData.bp.severity}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Review Doctor</span>
                      <span className="font-bold text-slate-300 block mt-0.5">{conditionsData.bp.doctor}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans bg-slate-950/20 p-2.5 rounded-lg border border-white/5 mt-2">
                    <strong className="text-slate-200 block mb-0.5 text-[9px] uppercase tracking-wider">Clinician Directive:</strong> {conditionsData.bp.advice}
                  </p>
                </div>
              ) : null}

              {conditionsData.diabetes ? (
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-slate-200">Diabetes / Blood Glucose</span>
                    <span className={`text-[9px] font-mono font-bold uppercase ${conditionsData.diabetes.trendColor}`}>
                      {conditionsData.diabetes.trend}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Latest Glucose Reading</span>
                      <span className="font-bold text-slate-200 block mt-0.5">{conditionsData.diabetes.value}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Status Class</span>
                      <span className="font-bold text-slate-200 block mt-0.5">{conditionsData.diabetes.severity}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans bg-slate-950/20 p-2.5 rounded-lg border border-white/5 mt-2">
                    <strong className="text-slate-200 block mb-0.5 text-[9px] uppercase tracking-wider">Dietary Advice:</strong> {conditionsData.diabetes.advice}
                  </p>
                </div>
              ) : null}

              {conditionsData.anemia ? (
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-slate-200">Maternal & Child Anemia</span>
                    <span className={`text-[9px] font-mono font-bold uppercase ${conditionsData.anemia.trendColor}`}>
                      {conditionsData.anemia.trend}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Latest Hemoglobin</span>
                      <span className="font-bold text-slate-200 block mt-0.5">{conditionsData.anemia.value}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Anemia Severity</span>
                      <span className="font-bold text-slate-250 block mt-0.5">{conditionsData.anemia.severity}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Iron Tablet Status</span>
                      <span className="font-bold text-emerald-450 block mt-0.5">{conditionsData.anemia.ifaStatus}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans bg-slate-950/20 p-2.5 rounded-lg border border-white/5 mt-2">
                    <strong className="text-slate-200 block mb-0.5 text-[9px] uppercase tracking-wider">Nutritional Advice:</strong> {conditionsData.anemia.advice}
                  </p>
                </div>
              ) : null}

              {!conditionsData.bp && !conditionsData.diabetes && !conditionsData.anemia && (
                <p className="text-xs text-slate-500 italic text-center py-6">No diagnosed chronic conditions logged.</p>
              )}
            </div>
          </div>
        </div>

        {/* DOCTOR'S ADVICE SUMMARY (1 Col) */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-2.5">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-sans flex items-center gap-2">
                <Stethoscope className="w-4.5 h-4.5 text-cyan-400" /> Doctor's Advice
              </h3>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-550 font-bold uppercase tracking-wider block">Prescribed Medication</span>
                <span className="text-slate-300 block">{adviceData.medication}</span>
              </div>

              <div className="space-y-1 border-t border-white/[0.03] pt-2.5">
                <span className="text-[9px] text-slate-550 font-bold uppercase tracking-wider block">Lifestyle Guidelines</span>
                <span className="text-slate-400 block leading-normal">{adviceData.lifestyle}</span>
              </div>

              <div className="space-y-1 border-t border-white/[0.03] pt-2.5">
                <span className="text-[9px] text-slate-550 font-bold uppercase tracking-wider block">Diet Recommendation</span>
                <span className="text-slate-450 block leading-normal">{adviceData.diet}</span>
              </div>

              <div className="space-y-1 border-t border-white/[0.03] pt-2.5">
                <span className="text-[9px] text-slate-550 font-bold uppercase tracking-wider block">Daily Exercises</span>
                <span className="text-slate-400 block">{adviceData.exercise}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-[10px] text-emerald-455 font-mono mt-4 font-bold">
            {adviceData.reminder}
          </div>
        </div>
      </div>

      {/* Row 4: Health Progress trends & Educational Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* HEALTH PROGRESS TRENDS (2 Cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <h3 className="text-xs font-bold text-slate-355 uppercase tracking-wider font-sans flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-455" /> Health Progress Trends
            </h3>
            <span className={`px-2 py-0.5 rounded text-[9px] font-mono border font-extrabold uppercase ${progressStatus.color}`}>
              Status: {progressStatus.label}
            </span>
          </div>

          <div className="h-60 mt-4">
            {sortedScreenings.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 10 }} />
                  <Area type="monotone" dataKey="hb" name="Hemoglobin (g/dL)" stroke="#f43f5e" fillOpacity={0.05} fill="url(#colorHb)" />
                  <Area type="monotone" dataKey="bp" name="Systolic BP (mmHg)" stroke="#06b6d4" fillOpacity={0.05} fill="url(#colorBp)" />
                  <Area type="monotone" dataKey="sugar" name="Blood Glucose (mg/dL)" stroke="#a855f7" fillOpacity={0.05} fill="url(#colorSugar)" />
                  <defs>
                    <linearGradient id="colorHb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">No progress data logged yet.</div>
            )}
          </div>
          <div className="flex justify-around text-[9px] text-[#475569] font-mono pt-2 border-t border-white/5">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#f43f5e] inline-block" /> Hemoglobin (Hb)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#06b6d4] inline-block" /> Blood Pressure (Systolic)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#a855f7] inline-block" /> Blood Sugar</span>
          </div>
        </div>

        {/* HEALTH EDUCATION COMPANION (1 Col) */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="border-b border-white/5 pb-2.5">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-sans flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-cyan-400" /> Health Education
            </h3>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[260px] pr-1">
            {conditionsData.bp && (
              <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-cyan-400 uppercase text-[9px] tracking-wider block">❤️ High Blood Pressure Tips</span>
                <ul className="space-y-1 text-slate-350 list-disc list-inside">
                  <li>Reduce daily salt intake</li>
                  <li>Perform light exercises regularly</li>
                  <li>Avoid tobacco and smoking</li>
                  <li>Take BP medicines daily at set times</li>
                </ul>
              </div>
            )}

            {conditionsData.diabetes && (
              <div className="p-3 bg-[#a855f7]/5 border border-[#a855f7]/10 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-[#a855f7] uppercase text-[9px] tracking-wider block">🍬 Diabetes Control Tips</span>
                <ul className="space-y-1 text-slate-355 list-disc list-inside">
                  <li>Eat high-fiber vegetables & beans</li>
                  <li>Wash & inspect your feet daily</li>
                  <li>Monitor glucose readings regularly</li>
                  <li>Limit white rice and sugar foods</li>
                </ul>
              </div>
            )}

            {conditionsData.anemia && (
              <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-rose-400 uppercase text-[9px] tracking-wider block">🩸 Anemia Care Guidelines</span>
                <ul className="space-y-1 text-slate-350 list-disc list-inside">
                  <li>Eat iron-rich foods (spinach, jaggery)</li>
                  <li>Eat fruits rich in Vitamin C (lemon, orange)</li>
                  <li>Continue taking IFA supplements daily</li>
                  <li>Do not consume tea/coffee with meals</li>
                </ul>
              </div>
            )}

            {!conditionsData.bp && !conditionsData.diabetes && !conditionsData.anemia && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-emerald-400 uppercase text-[9px] tracking-wider block">🌿 General Wellness Tips</span>
                <ul className="space-y-1 text-slate-350 list-disc list-inside">
                  <li>Drink 8-10 glasses of clean water daily</li>
                  <li>Walk briskly for 30 minutes daily</li>
                  <li>Sleep 7-8 hours nightly</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 5: AI Health Assistant Integration */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-5">
        <div className="border-b border-white/5 pb-2.5">
          <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-sans flex items-center gap-2">
            <Bot className="w-4.5 h-4.5 text-cyan-400" /> AI Health Assistant Companion
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col bg-slate-950/20 border border-white/5 rounded-xl overflow-hidden h-[300px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    m.sender === 'bot' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {m.sender === 'bot' ? 'AI' : 'PT'}
                  </div>
                  <div className={`p-3 rounded-xl text-xs max-w-[80%] leading-relaxed ${
                    m.sender === 'bot' ? 'bg-[#0f172a]/60 border border-white/5 text-slate-300' : 'bg-cyan-900/20 border border-cyan-500/10 text-slate-200'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-[9px] font-bold">
                    AI
                  </div>
                  <div className="p-3 bg-[#0f172a]/60 border border-white/5 rounded-xl text-xs text-slate-500 font-mono animate-pulse">
                    Consulting clinical indexes...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendCustomMessage} className="p-2 border-t border-white/5 bg-[#070b13] flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me anything about your vitals or recommendations..."
                disabled={aiLoading}
                className="flex-1 bg-transparent border-0 text-xs text-slate-200 outline-none focus:ring-0 px-2 py-1.5"
              />
              <button
                type="submit"
                disabled={aiLoading || !inputText.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black text-[10px] font-bold hover:bg-emerald-400 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="lg:col-span-1 flex flex-col justify-center space-y-4">
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Suggested Prompts</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Click a suggestion to instantly query your health assistant.</p>
            </div>

            <div className="flex flex-col gap-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskAI(prompt)}
                  disabled={aiLoading}
                  className="w-full p-3 bg-white/[0.01] border border-white/5 hover:bg-white/[0.04] rounded-xl text-left text-xs text-slate-350 transition-all font-semibold flex justify-between items-center group disabled:opacity-50"
                >
                  <span>{prompt}</span>
                  <HelpCircle className="w-4 h-4 text-slate-650 group-hover:text-cyan-400 transition-colors flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 6: Reusable timeline */}
      {screenings.length > 0 && (
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="border-b border-white/5 pb-2.5">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-sans flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-cyan-400" /> My Health Journey
            </h3>
          </div>
          <PatientTimeline screenings={screenings} />
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
