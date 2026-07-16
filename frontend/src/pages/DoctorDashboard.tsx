import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Check, X, ShieldAlert, Sparkles, Search, 
  FileText, Printer, BookOpen, Activity, AlertCircle, RefreshCw, 
  BarChart2, Plus, Trash2, CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import appointmentService from '../services/appointmentService';
import prescriptionService from '../services/prescriptionService';
import reportService from '../services/reportService';
import aiService from '../services/aiService';
import screeningService from '../services/screeningService';
import { useApp } from '../context/AppContext';
import { CardSkeleton, TableSkeleton, SuccessState } from '../components/common/Loader';
import { MetricCard } from '../components/cards/MetricCard';
import { ScreeningSummaryCard } from '../components/screening/ScreeningSummaryCard';
import { ClinicalRecommendationCard } from '../components/screening/ClinicalRecommendationCard';
import { Appointment, MedicalReport, Prescription, Screening } from '../types';

interface PatientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  dob?: string;
  address?: string;
  medicalHistory?: string[];
  allergies?: string[];
}

interface PrescriptionItemInput {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

// Chart Seed Datasets
const patientDistData = [
  { name: 'Pediatrics (0-18)', value: 12 },
  { name: 'Adults (19-50)', value: 45 },
  { name: 'Geriatrics (51+)', value: 28 }
];

const apptLoadData = [
  { name: 'Mon', count: 14 },
  { name: 'Tue', count: 18 },
  { name: 'Wed', count: 12 },
  { name: 'Thu', count: 20 },
  { name: 'Fri', count: 15 },
  { name: 'Sat', count: 8 }
];

const diseaseTrendData = [
  { week: 'Wk 1', Hypertension: 24, Diabetes: 18, Influenza: 12 },
  { week: 'Wk 2', Hypertension: 28, Diabetes: 20, Influenza: 22 },
  { week: 'Wk 3', Hypertension: 26, Diabetes: 19, Influenza: 34 },
  { week: 'Wk 4', Hypertension: 30, Diabetes: 22, Influenza: 18 }
];

const COLORS = ['#22d3ee', '#34d399', '#a855f7', '#f43f5e'];

export const DoctorDashboard: React.FC = () => {
  const { addNotification } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Layout View Tabs: 'workspace' | 'analytics'
  const [dashboardTab, setDashboardTab] = useState<'workspace' | 'analytics'>('workspace');

  // Queue state variables
  const [queueTab, setQueueTab] = useState<'today' | 'all' | 'pending' | 'emergency' | 'screenings'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'LOW' | 'MODERATE' | 'CRITICAL'>('ALL');

  // Patient workspace variables
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [patientReports, setPatientReports] = useState<MedicalReport[]>([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([]);
  
  // Doctor Screening Evaluation States
  const [docReviewNotes, setDocReviewNotes] = useState('');
  const [docActionTaken, setDocActionTaken] = useState('lifestyle_changes');
  const [docFollowUpDate, setDocFollowUpDate] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Workspace tabs: 'history' | 'diagnosis' | 'prescription' | 'reports'
  const [workspaceTab, setWorkspaceTab] = useState<'history' | 'diagnosis' | 'prescription' | 'reports'>('history');

  // Diagnosis inputs
  const [symptomsInput, setSymptomsInput] = useState('');
  const [observationsInput, setObservationsInput] = useState('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Prescription builder inputs
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemInput[]>([]);
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medFreq, setMedFreq] = useState('Once daily');
  const [medDur, setMedDur] = useState('5 days');
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [generatedPrescription, setGeneratedPrescription] = useState<Prescription | null>(null);

  // AI Assistant states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiDisclaimer, setAiDisclaimer] = useState(false);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScreenings = async () => {
    try {
      const data = await screeningService.getScreenings();
      setScreenings(data);
    } catch (err) {
      console.error('Error fetching screenings:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchScreenings();
    
    const handleDemoRefresh = () => {
      fetchAppointments();
      fetchScreenings();
    };
    window.addEventListener('medibridge-demo-refresh', handleDemoRefresh);
    return () => {
      window.removeEventListener('medibridge-demo-refresh', handleDemoRefresh);
    };
  }, []);

  const handleReviewScreeningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScreening || !docReviewNotes.trim()) return;
    setReviewSubmitting(true);
    try {
      const updated = await screeningService.reviewScreening(selectedScreening.id, {
        doctorNotes: docReviewNotes,
        actionTaken: docActionTaken,
        followUpDate: docFollowUpDate || undefined,
      });

      setScreenings(prev => prev.map(s => s.id === selectedScreening.id ? updated : s));
      setSelectedScreening(updated);
      setSuccessMsg(`Screening evaluation successfully saved for ${selectedScreening.patientName}.`);
      addNotification(
        'Screening Reviewed',
        `Completed medical review for ${selectedScreening.patientName}.`,
        'followup'
      );
      setDocReviewNotes('');
      setDocFollowUpDate('');
    } catch (err) {
      console.error('Error submitting screening review:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Fetch patient profile, history, reports, and prescriptions on patient change
  useEffect(() => {
    if (selectedAppt) {
      const loadPatientData = async () => {
        try {
          // Attempt to retrieve profile metadata from localStorage
          const profileKey = `medibridge_profile_${selectedAppt.patientId}`;
          const profileVal = localStorage.getItem(profileKey);
          let loadedProfile: PatientProfile = {
            id: selectedAppt.patientId,
            name: selectedAppt.patientName,
            email: `${selectedAppt.patientName.toLowerCase().replace(/\s+/g, '')}@medibridge.com`,
            gender: 'unspecified',
            dob: '1990-01-01',
            medicalHistory: ['Hypertension'],
            allergies: ['Penicillin']
          };

          if (profileVal) {
            try {
              const parsed = JSON.parse(profileVal);
              loadedProfile = { ...loadedProfile, ...parsed };
            } catch (e) {
              // ignore
            }
          }
          setPatientProfile(loadedProfile);

          // Get reports and prescriptions
          const [allReports, allPresc] = await Promise.all([
            reportService.getReports(),
            prescriptionService.getPrescriptions()
          ]);

          setPatientReports(allReports.filter(r => r.patientId === selectedAppt.patientId));
          setPatientPrescriptions(allPresc.filter(p => p.patientId === selectedAppt.patientId));
        } catch (err) {
          console.error('Error fetching patient data details', err);
        }
      };

      loadPatientData();
      setWorkspaceTab('history');
      setSymptomsInput(selectedAppt.reason || '');
      setObservationsInput('');
      setDiagnosisNotes(selectedAppt.notes || '');
      setPrescriptionItems([]);
      setGeneratedPrescription(null);
      setAiResult(null);
    } else {
      setPatientProfile(null);
      setPatientReports([]);
      setPatientPrescriptions([]);
    }
  }, [selectedAppt]);

  const handleApprove = async (id: string, name: string) => {
    try {
      const updated = await appointmentService.updateAppointmentStatus(id, 'approved');
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedAppt?.id === id) {
        setSelectedAppt(updated);
      }
      setSuccessMsg(`Approved appointment request for ${name}.`);
      addNotification(
        'Appointment Confirmed',
        `Meeting with patient ${name} has been approved.`,
        'appointment'
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id: string, name: string) => {
    try {
      const updated = await appointmentService.updateAppointmentStatus(id, 'cancelled');
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      if (selectedAppt?.id === id) {
        setSelectedAppt(updated);
      }
      setSuccessMsg(`Cancelled appointment slot for ${name}.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt || !diagnosisNotes.trim()) return;

    setSavingNotes(true);
    try {
      // Save diagnosis to the appointment notes
      const notesWithObservations = `${diagnosisNotes}${observationsInput ? `\nObservations: ${observationsInput}` : ''}`;
      const updated = await appointmentService.updateAppointmentStatus(selectedAppt.id, 'completed');
      
      // Manually set notes for the local state representation
      updated.notes = notesWithObservations;
      
      // Update local storage demo records if in demo mode
      const stored = JSON.parse(localStorage.getItem('medibridge_demo_appointments') || '[]');
      const idx = stored.findIndex((a: any) => a.id === selectedAppt.id);
      if (idx > -1) {
        stored[idx].status = 'completed';
        stored[idx].notes = notesWithObservations;
        localStorage.setItem('medibridge_demo_appointments', JSON.stringify(stored));
      }

      setAppointments(prev => prev.map(a => a.id === selectedAppt.id ? updated : a));
      setSelectedAppt(updated);
      setSuccessMsg('Clinical consultation details saved successfully.');
      addNotification(
        'Consultation Completed',
        `Summary reports compiled for patient ${selectedAppt.patientName}.`,
        'followup'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAddMedicine = () => {
    if (!medName.trim() || !medDose.trim()) return;
    setPrescriptionItems(prev => [...prev, {
      medicineName: medName,
      dosage: medDose,
      frequency: medFreq,
      duration: medDur
    }]);
    setMedName('');
    setMedDose('');
  };

  const handleRemoveMedicine = (idx: number) => {
    setPrescriptionItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSavePrescription = async () => {
    if (!selectedAppt || prescriptionItems.length === 0) return;

    setSavingPrescription(true);
    try {
      const newPresc = await prescriptionService.createPrescription({
        patientId: selectedAppt.patientId,
        patientName: selectedAppt.patientName,
        doctorId: 'doc_01',
        doctorName: 'Dr. Sarika Sharma',
        instructions: 'Take medications strictly as instructed. Schedule review in 15 days.',
        medicines: prescriptionItems
      });

      setPatientPrescriptions(prev => [newPresc, ...prev]);
      setGeneratedPrescription(newPresc);
      setPrescriptionItems([]);
      setSuccessMsg('Prescription generated successfully.');
      addNotification(
        'New Prescription Issued',
        `A prescription was created for ${selectedAppt.patientName}.`,
        'prescription'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPrescription(false);
    }
  };

  // AI Assistant hooks calls
  const handleAISymptomCheck = async () => {
    if (!symptomsInput.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    setAiDisclaimer(true);
    try {
      const res = await aiService.analyzeSymptoms(symptomsInput);
      const formatted = `### Symptoms Summary\n${res.summary}\n\n**Risk Level**: ${res.riskLevel}\n\n**Possible Causes**:\n${res.possibleCauses.map(c => `- ${c}`).join('\n')}\n\n**Recommendations**:\n${res.recommendations.map(r => `- ${r}`).join('\n')}`;
      setAiResult(formatted);
    } catch (err) {
      console.error(err);
      setAiResult('Error loading AI insights. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIDiagnosisCheck = async () => {
    if (!symptomsInput.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    setAiDisclaimer(true);
    try {
      const res = await aiService.calculateRiskScore(symptomsInput, { BP: '120/80', heartRate: 72 });
      const formatted = `### Clinical Triage Risk Calculation\n**Risk Score**: ${res.score}/100\n**Risk Level**: ${res.level}\n\n**Primary Risk Factors**:\n${res.primaryRiskFactors.map(f => `- ${f}`).join('\n')}\n\n**Details**:\n${res.details}`;
      setAiResult(formatted);
    } catch (err) {
      console.error(err);
      setAiResult('Error loading AI insights. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIReportAnalyze = async (report: MedicalReport) => {
    setWorkspaceTab('reports');
    setAiLoading(true);
    setAiResult(null);
    setAiDisclaimer(true);
    try {
      const res = await aiService.analyzeMedicalReport(
        report.title,
        report.parsedInsights?.summary || 'Routine checkup details.'
      );
      const formatted = `### Medical Report Analysis\n${res.summary}\n\n**Key Metrics Analyzed**:\n${res.keyMetrics.map(m => `- ${m.name}: ${m.value} (${m.status})`).join('\n')}\n\n**Clinical Findings**:\n${res.findings.map(f => `- ${f}`).join('\n')}\n\n**Directives & Recommendations**:\n${res.recommendations.map(r => `- ${r}`).join('\n')}`;
      setAiResult(formatted);
    } catch (err) {
      console.error(err);
      setAiResult('Error analyzing clinical reports. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Helpers to calculate age from DOB
  const calculateAge = (dobString?: string) => {
    if (!dobString) return '35';
    const birthDate = new Date(dobString);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // List filters
  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = appt.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Urgency logic based on keywords
    let patientUrgency = 'LOW';
    const reasonLower = appt.reason.toLowerCase();
    if (reasonLower.includes('chest') || reasonLower.includes('breath') || reasonLower.includes('heart') || reasonLower.includes('tightness')) {
      patientUrgency = 'CRITICAL';
    } else if (reasonLower.includes('pain') || reasonLower.includes('stomach') || reasonLower.includes('headache')) {
      patientUrgency = 'MODERATE';
    }

    const matchesUrgency = urgencyFilter === 'ALL' || patientUrgency === urgencyFilter;

    let matchesQueue = true;
    if (queueTab === 'today') {
      const today = new Date().toISOString().split('T')[0];
      matchesQueue = appt.dateTime.startsWith(today);
    } else if (queueTab === 'pending') {
      matchesQueue = appt.status === 'pending';
    } else if (queueTab === 'emergency') {
      matchesQueue = patientUrgency === 'CRITICAL';
    }

    return matchesSearch && matchesUrgency && matchesQueue;
  });

  const filteredScreenings = screenings.filter(scr => {
    const matchesSearch = scr.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency = urgencyFilter === 'ALL' || scr.riskClassifications.overall === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const criticalCount = appointments.filter(a => {
    const reasonLower = a.reason.toLowerCase();
    return reasonLower.includes('chest') || reasonLower.includes('breath') || reasonLower.includes('heart') || reasonLower.includes('tightness');
  }).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {successMsg && (
        <SuccessState message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}

      {/* Header bar with view toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans">Clinical Operations Control</h2>
          <p className="text-xs text-slate-400 mt-1">Review active patient queue summaries, build digital prescriptions, and analyze telemetry diagnostics.</p>
        </div>

        <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-white/5 w-fit">
          <button
            onClick={() => setDashboardTab('workspace')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              dashboardTab === 'workspace'
                ? 'bg-[#1e293b] text-cyan-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Workspace
          </button>
          <button
            onClick={() => setDashboardTab('analytics')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              dashboardTab === 'analytics'
                ? 'bg-[#1e293b] text-emerald-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Analytics
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton rows={4} />
        </div>
      ) : dashboardTab === 'analytics' ? (
        /* ================= CLINICAL ANALYTICS VIEW ================= */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Distribution */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-80">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-3">Patient Distribution</h4>
              <div className="flex-1 w-full text-xs min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={patientDistData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {patientDistData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Appointment Load */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-80">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-3">Appointment Load</h4>
              <div className="flex-1 w-full text-xs min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={apptLoadData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Disease Trends */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-80">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-3">Disease Trends</h4>
              <div className="flex-1 w-full text-xs min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={diseaseTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" />
                    <YAxis stroke="rgba(255,255,255,0.3)" />
                    <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="Hypertension" stroke="#22d3ee" strokeWidth={2} />
                    <Line type="monotone" dataKey="Diabetes" stroke="#a855f7" strokeWidth={2} />
                    <Line type="monotone" dataKey="Influenza" stroke="#f43f5e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= CLINICAL WORKSPACE VIEW ================= */
        <div className="space-y-6">
          {/* Operations Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Active Patients"
              value={`${appointments.filter(a => a.status === 'approved' || a.status === 'completed').length} cases`}
              subtext="Logged in current queue cycle"
              icon={<User className="w-4 h-4" />}
              accentColor="cyan"
            />
            <MetricCard
              title="Pending Requests"
              value={`${pendingCount} requests`}
              subtext="Requires clinician verification"
              icon={<Calendar className="w-4 h-4" />}
              accentColor="emerald"
            />
            <MetricCard
              title="Critical Triage Alerts"
              value={`${criticalCount} cases`}
              subtext="Cardiac or respiratory urgency flags"
              icon={<ShieldAlert className="w-4 h-4" />}
              accentColor="rose"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 1. Patient Queue Panel (Left 4 cols) */}
            <div className="lg:col-span-4 glass-card p-5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Patient Triage Queue</h3>
                <span className="text-[10px] text-slate-500 font-mono">{queueTab === 'screenings' ? filteredScreenings.length : filteredAppointments.length} matching</span>
              </div>

              {/* Filters */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patients by name..."
                    className="w-full pl-9 pr-3 py-1.5 bg-[#0b1120] border border-white/5 rounded-lg text-[11px] text-slate-200 focus:outline-none"
                  />
                </div>

                {/* Queue Tab switches */}
                <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-white/5 text-[9px] font-bold">
                  <button onClick={() => { setQueueTab('all'); setSelectedScreening(null); }} className={`flex-1 py-1 rounded-md ${queueTab === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}>All</button>
                  <button onClick={() => { setQueueTab('today'); setSelectedScreening(null); }} className={`flex-1 py-1 rounded-md ${queueTab === 'today' ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}>Today</button>
                  <button onClick={() => { setQueueTab('pending'); setSelectedScreening(null); }} className={`flex-1 py-1 rounded-md ${queueTab === 'pending' ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}>Pending</button>
                  <button onClick={() => { setQueueTab('emergency'); setSelectedScreening(null); }} className={`flex-1 py-1 rounded-md ${queueTab === 'emergency' ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}>Urgent</button>
                  <button onClick={() => { setQueueTab('screenings'); setSelectedAppt(null); }} className={`flex-1 py-1 rounded-md ${queueTab === 'screenings' ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}>Screenings</button>
                </div>

                {/* Urgency Badge selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Urgency:</span>
                  {(['ALL', 'LOW', 'MODERATE', 'CRITICAL'] as const).map(u => (
                    <button
                      key={u}
                      onClick={() => setUrgencyFilter(u)}
                      className={`text-[8px] px-2 py-0.5 rounded border ${
                        urgencyFilter === u 
                          ? 'bg-slate-800 text-slate-200 border-white/10' 
                          : 'text-slate-500 border-transparent hover:text-slate-300'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Appointments List */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {queueTab === 'screenings' ? (
                  filteredScreenings.length > 0 ? (
                    filteredScreenings.map(scr => {
                      const isSelected = selectedScreening?.id === scr.id;
                      return (
                        <button
                          key={scr.id}
                          onClick={() => {
                            setSelectedScreening(scr);
                            setSelectedAppt(null);
                          }}
                          className={`w-full p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                            isSelected 
                              ? 'bg-cyan-500/5 border-cyan-500/20 shadow-glow-cyan' 
                              : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <h4 className="text-xs font-bold text-slate-200">{scr.patientName}</h4>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${
                              scr.status === 'reviewed'
                                ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse'
                            }`}>
                              {scr.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium truncate w-full">{scr.screeningType} Risk: {scr.riskClassifications.overall}</p>
                          <span className="text-[8px] text-slate-500 font-mono">
                            {new Date(scr.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 text-slate-600 text-xs">
                      No matching screenings found.
                    </div>
                  )
                ) : filteredAppointments.length > 0 ? (
                  filteredAppointments.map(appt => {
                    const isSelected = selectedAppt?.id === appt.id;
                    const isCritical = appt.reason.toLowerCase().includes('chest') || appt.reason.toLowerCase().includes('breath') || appt.reason.toLowerCase().includes('heart');
                    return (
                      <button
                        key={appt.id}
                        onClick={() => {
                          setSelectedAppt(appt);
                          setSelectedScreening(null);
                        }}
                        className={`w-full p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          isSelected 
                            ? 'bg-cyan-500/5 border-cyan-500/20 shadow-glow-cyan' 
                            : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <h4 className="text-xs font-bold text-slate-200">{appt.patientName}</h4>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${
                            isCritical
                              ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                              : appt.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {isCritical ? 'Critical' : appt.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate w-full">{appt.reason}</p>
                        <span className="text-[8px] text-slate-500 font-mono">
                          {new Date(appt.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-600 text-xs">
                    No matching patients found.
                  </div>
                )}
              </div>
            </div>

            {/* 2. Patient Active Workspace (Right 8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {selectedScreening ? (
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-5">
                  {/* Top patient banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center font-bold text-black text-sm shadow-glow-cyan flex-shrink-0">
                        {selectedScreening.patientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">{selectedScreening.patientName}</h3>
                        <p className="text-[10px] text-slate-400 font-sans">
                          Patient ID: {selectedScreening.patientId} • Triage Type: {selectedScreening.screeningType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className={`text-[10px] border px-2.5 py-1 rounded font-bold uppercase ${
                        selectedScreening.status === 'reviewed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                      }`}>
                        {selectedScreening.status === 'reviewed' ? 'Reviewed' : 'Awaiting Evaluation'}
                      </span>
                    </div>
                  </div>

                  {/* Vitals Summary Card */}
                  <ScreeningSummaryCard screening={selectedScreening} />

                  {/* Rule-based Clinical Reference Guideline */}
                  <ClinicalRecommendationCard screening={selectedScreening} />

                  {/* CHW Triage Details */}
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-xs space-y-1.5 text-slate-350">
                    <p><span className="text-slate-500">Intake Health Worker:</span> Ramesh Kumar (ID: {selectedScreening.chwId})</p>
                    <p><span className="text-slate-500">Screening Timestamp:</span> {new Date(selectedScreening.createdAt).toLocaleString()}</p>
                  </div>

                  {/* Doctor Review evaluation form or outcome display */}
                  {selectedScreening.status === 'pending' ? (
                    <form onSubmit={handleReviewScreeningSubmit} className="space-y-4 pt-2 border-t border-white/5">
                      <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-cyan-400" /> Clinic Consultation & Review
                      </h4>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Clinician Action Directives</label>
                        <select
                          value={docActionTaken}
                          onChange={(e) => setDocActionTaken(e.target.value)}
                          className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2.5 px-3 text-xs text-slate-200 focus:outline-none"
                        >
                          {selectedScreening.screeningType === 'Anemia' ? (
                            <>
                              <option value="lifestyle_changes">Nutritional & Diet Counseling</option>
                              <option value="medication">Dietary Iron Supplementation (IFA Tablets)</option>
                              <option value="referred">Referral for Severe Anemia Management</option>
                            </>
                          ) : (
                            <>
                              <option value="lifestyle_changes">Lifestyle Changes & Diet Monitoring</option>
                              <option value="medication">Pharmacological Prescription & Clinical Follow-up</option>
                              <option value="referred">Referred to Emergency Team</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Consultation Notes & Feedback</label>
                          <textarea
                            rows={3}
                            value={docReviewNotes}
                            onChange={(e) => setDocReviewNotes(e.target.value)}
                            placeholder="Write diagnosis, advice, or drug guidelines..."
                            className="w-full bg-[#0b1120] border border-white/5 rounded-lg p-3 text-xs text-slate-200 focus:outline-none resize-none"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Recommended Follow-up Date (Optional)</label>
                          <input
                            type="date"
                            value={docFollowUpDate}
                            onChange={(e) => setDocFollowUpDate(e.target.value)}
                            className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2.5 px-3 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="glass-btn-primary py-2.5 px-6 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        {reviewSubmitting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Submit Clinical Evaluation
                      </button>
                    </form>
                  ) : (
                    <div className="pt-4 border-t border-white/5 space-y-4">
                      <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Screening Review Completed
                      </h4>

                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-3 text-xs text-slate-300">
                        <p><span className="text-slate-500 font-bold block">Reviewing Clinician:</span> {selectedScreening.doctorName || 'Dr. Sarika Sharma'}</p>
                        <p><span className="text-slate-500 font-bold block">Action Directives:</span> {
                          selectedScreening.screeningType === 'Anemia'
                            ? (selectedScreening.actionTaken === 'lifestyle_changes' ? 'Nutritional & Diet Counseling' : selectedScreening.actionTaken === 'medication' ? 'Dietary Iron Supplementation (IFA Tablets)' : 'Referral for Severe Anemia Management')
                            : (selectedScreening.actionTaken === 'lifestyle_changes' ? 'Lifestyle Changes & Diet Monitoring' : selectedScreening.actionTaken === 'medication' ? 'Pharmacological Prescription & Clinical Follow-up' : 'Referred to Emergency Team')
                        }</p>
                        <p><span className="text-slate-500 font-bold block">Clinical Notes:</span> "{selectedScreening.doctorNotes}"</p>
                        {selectedScreening.followUpDate && (
                          <p><span className="text-slate-500 font-bold block">Follow-up Date:</span> {new Date(selectedScreening.followUpDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedAppt ? (
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-5">
                  {/* Top patient banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center font-bold text-black text-sm shadow-glow-cyan flex-shrink-0">
                        {selectedAppt.patientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-100">{selectedAppt.patientName}</h3>
                        <p className="text-[10px] text-slate-400 font-sans">
                          Patient ID: {selectedAppt.patientId} • Age: {calculateAge(patientProfile?.dob)} • {patientProfile?.gender || 'unspecified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {selectedAppt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(selectedAppt.id, selectedAppt.patientName)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 text-[10px] font-bold rounded-lg transition-all"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve Request
                          </button>
                          <button
                            onClick={() => handleCancel(selectedAppt.id, selectedAppt.patientName)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 active:scale-95 text-[10px] font-bold rounded-lg transition-all"
                          >
                            <X className="w-3.5 h-3.5" /> Reject Slot
                          </button>
                        </>
                      )}
                      {selectedAppt.status === 'approved' && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded font-bold uppercase">
                          Confirmed Consultation
                        </span>
                      )}
                      {selectedAppt.status === 'completed' && (
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded font-bold uppercase">
                          Consultation Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Workspace Subtabs */}
                  <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-white/5 text-[10px] font-bold w-fit">
                    <button onClick={() => { setWorkspaceTab('history'); setAiResult(null); }} className={`px-4 py-1.5 rounded-md ${workspaceTab === 'history' ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}>Profile & History</button>
                    <button onClick={() => { setWorkspaceTab('reports'); setAiResult(null); }} className={`px-4 py-1.5 rounded-md ${workspaceTab === 'reports' ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}>Diagnostic Reports</button>
                    <button onClick={() => { setWorkspaceTab('diagnosis'); setAiResult(null); }} className={`px-4 py-1.5 rounded-md ${workspaceTab === 'diagnosis' ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}>Diagnosis Workspace</button>
                    <button onClick={() => { setWorkspaceTab('prescription'); setAiResult(null); }} className={`px-4 py-1.5 rounded-md ${workspaceTab === 'prescription' ? 'bg-slate-800 text-slate-100' : 'text-slate-500'}`}>Prescription Builder</button>
                  </div>

                  {/* Workspace Content Display */}
                  <div className="space-y-4">
                    {/* A. Profile & Clinical History */}
                    {workspaceTab === 'history' && (
                      <div className="space-y-4 font-sans">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                            <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Clinical Context</h4>
                            <div className="space-y-1.5 text-xs text-slate-300">
                              <p><span className="text-slate-500">Address:</span> {patientProfile?.address}</p>
                              <p><span className="text-slate-500">Contact:</span> {patientProfile?.phone}</p>
                              <p><span className="text-slate-500">Email:</span> {patientProfile?.email}</p>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                            <h4 className="text-[11px] font-bold uppercase text-rose-400 tracking-wider">Allergies & History</h4>
                            <div className="space-y-2 text-xs">
                              <p><span className="text-slate-500">Allergies:</span> {patientProfile?.allergies?.join(', ') || 'None reported'}</p>
                              <p><span className="text-slate-500">Medical History:</span> {patientProfile?.medicalHistory?.join(', ') || 'No chronic records'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Previous Prescriptions */}
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold text-slate-300 border-b border-white/5 pb-1">Previous Prescriptions ({patientPrescriptions.length})</h4>
                          {patientPrescriptions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {patientPrescriptions.map(p => (
                                <div key={p.id} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-2 text-xs">
                                  <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span className="font-bold text-slate-200">Date: {p.date}</span>
                                    <span className="text-emerald-400 uppercase font-bold text-[9px] bg-emerald-500/10 px-1.5 rounded">{p.status}</span>
                                  </div>
                                  <div className="space-y-1">
                                    {p.medicines.map((med: any, idx: number) => (
                                      <p key={idx} className="text-slate-400 text-[11px]">- {med.medicineName} ({med.dosage}) • {med.frequency} • {med.duration}</p>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-600">No previous prescriptions recorded.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* B. Diagnostic Reports Review */}
                    {workspaceTab === 'reports' && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-300">Available Diagnostic Panels</h4>
                          {patientReports.length > 0 ? (
                            <div className="space-y-3">
                              {patientReports.map(rep => (
                                <div key={rep.id} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-cyan-400" />
                                      <h5 className="text-xs font-bold text-slate-200">{rep.title}</h5>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-sans">Uploaded on: {new Date(rep.uploadDate).toLocaleDateString()}</p>
                                    {rep.parsedInsights && (
                                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{rep.parsedInsights.summary}</p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleAIReportAnalyze(rep)}
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg text-[10px] font-bold transition-all self-start sm:self-center"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" /> Explain with AI
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-600">No diagnostic reports uploaded for this patient.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* C. Diagnosis Workspace */}
                    {workspaceTab === 'diagnosis' && (
                      <form onSubmit={handleSaveDiagnosis} className="space-y-4 font-sans">
                        <div className="space-y-3 p-4 rounded-xl bg-white/[0.01] border border-white/5">
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-cyan-400" /> Clinical Diagnosis Documentation
                          </h4>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Patient Reported Symptoms</label>
                            <input
                              type="text"
                              value={symptomsInput}
                              onChange={(e) => setSymptomsInput(e.target.value)}
                              placeholder="Describe patient symptoms..."
                              className="w-full glass-input text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase">Clinical Observations</label>
                              <textarea
                                rows={3}
                                value={observationsInput}
                                onChange={(e) => setObservationsInput(e.target.value)}
                                placeholder="E.g. BP slightly high, chest clear on auscultation..."
                                className="w-full glass-input text-xs resize-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase">Clinician Diagnostic Summary</label>
                              <textarea
                                rows={3}
                                value={diagnosisNotes}
                                onChange={(e) => setDiagnosisNotes(e.target.value)}
                                placeholder="Enter clinical assessment notes..."
                                className="w-full glass-input text-xs resize-none"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-white/[0.03]">
                            <button
                              type="button"
                              onClick={handleAISymptomCheck}
                              disabled={!symptomsInput}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold rounded-lg transition-all"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Analyze Symptoms (AI)
                            </button>
                            <button
                              type="button"
                              onClick={handleAIDiagnosisCheck}
                              disabled={!symptomsInput}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-[10px] font-bold rounded-lg transition-all"
                            >
                              <Activity className="w-3.5 h-3.5" /> Suggest Diagnosis (AI)
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={savingNotes}
                          className="glass-btn-primary px-6 py-2.5 text-xs font-bold"
                        >
                          {savingNotes ? 'Saving Records...' : 'Save Consultation Record'}
                        </button>
                      </form>
                    )}

                    {/* D. Prescription Builder */}
                    {workspaceTab === 'prescription' && (
                      <div className="space-y-4 font-sans">
                        {generatedPrescription ? (
                          /* Render generated prescription receipt details */
                          <div className="p-6 rounded-2xl bg-slate-900/40 border border-emerald-500/30 space-y-4 relative overflow-hidden" id="printable-prescription">
                            <div className="flex justify-between items-start border-b border-white/5 pb-3">
                              <div>
                                <h4 className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">MEDIBRIDGE Rx Presc</h4>
                                <p className="text-[9px] text-slate-500">Apollo Specialty Cardiac Hub Delhi</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Issued</span>
                                <p className="text-[9px] text-slate-500 mt-1">Date: {generatedPrescription.date}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-[11px] border-b border-white/[0.03] pb-3">
                              <div>
                                <p className="text-slate-500">DOCTOR SIGNATURE</p>
                                <p className="font-bold text-slate-300">{generatedPrescription.doctorName}</p>
                                <p className="text-[10px] text-slate-500">M.D. Cardiologist</p>
                              </div>
                              <div>
                                <p className="text-slate-500">PRESCRIBED TO</p>
                                <p className="font-bold text-slate-300">{generatedPrescription.patientName}</p>
                                <p className="text-[10px] text-slate-500">ID: {generatedPrescription.patientId}</p>
                              </div>
                            </div>

                            <div className="space-y-2 text-xs">
                              <p className="font-bold text-slate-300 uppercase tracking-wider text-[10px] text-slate-400">Medicines Checklist</p>
                              {generatedPrescription.medicines.map((m, idx) => (
                                <div key={idx} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between">
                                  <div>
                                    <p className="font-extrabold text-slate-200">{m.medicineName}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Qty/Freq: {m.frequency} • Dosage: {m.dosage}</p>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-bold font-mono">Duration: {m.duration}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2.5 pt-4 border-t border-white/5 z-10 relative">
                              <button
                                onClick={() => window.print()}
                                className="flex items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"
                              >
                                <Printer className="w-3.5 h-3.5" /> Print Rx
                              </button>
                              <button
                                onClick={() => setGeneratedPrescription(null)}
                                className="text-[10px] font-bold text-slate-500 hover:text-slate-300"
                              >
                                Create Another Rx
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Prescription Form Input List Builder */
                          <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                              <h4 className="text-xs font-bold text-slate-300 border-b border-white/5 pb-1 uppercase tracking-wider">Clinical Prescriptions Builder</h4>
                              
                              {/* Builder form grid */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase">Medicine Name</label>
                                  <input
                                    type="text"
                                    value={medName}
                                    onChange={(e) => setMedName(e.target.value)}
                                    placeholder="E.g. Lipitor"
                                    className="w-full glass-input text-xs py-2"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase">Dosage</label>
                                  <input
                                    type="text"
                                    value={medDose}
                                    onChange={(e) => setMedDose(e.target.value)}
                                    placeholder="E.g. 20mg"
                                    className="w-full glass-input text-xs py-2"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase">Frequency</label>
                                  <select
                                    value={medFreq}
                                    onChange={(e) => setMedFreq(e.target.value)}
                                    className="w-full glass-input text-xs py-2 bg-[#0b1120]"
                                  >
                                    <option value="Once daily">Once daily (morning)</option>
                                    <option value="Once daily (bedtime)">Once daily (bedtime)</option>
                                    <option value="Twice daily">Twice daily (AM/PM)</option>
                                    <option value="Three times daily">Three times daily</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase">Duration</label>
                                  <input
                                    type="text"
                                    value={medDur}
                                    onChange={(e) => setMedDur(e.target.value)}
                                    placeholder="E.g. 15 days"
                                    className="w-full glass-input text-xs py-2"
                                  />
                                </div>
                              </div>
                              
                              <button
                                type="button"
                                onClick={handleAddMedicine}
                                disabled={!medName || !medDose}
                                className="flex items-center gap-1 text-[10px] font-bold bg-cyan-500 hover:bg-cyan-600 text-black px-3 py-2 rounded-lg transition-all"
                              >
                                <Plus className="w-3.5 h-3.5 text-black stroke-[3]" /> Add Medicine Item
                              </button>
                            </div>

                            {/* Added list */}
                            <div className="space-y-2">
                              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue List ({prescriptionItems.length})</h5>
                              {prescriptionItems.length > 0 ? (
                                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                                  {prescriptionItems.map((item, idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-white/[0.01] border border-white/5 flex items-center justify-between text-xs">
                                      <div>
                                        <span className="font-extrabold text-slate-200">{item.medicineName} ({item.dosage})</span>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{item.frequency} • {item.duration}</p>
                                      </div>
                                      <button
                                        onClick={() => handleRemoveMedicine(idx)}
                                        className="text-slate-500 hover:text-rose-400 p-1"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}

                                  <button
                                    onClick={handleSavePrescription}
                                    disabled={savingPrescription}
                                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-bold active:scale-95 transition-all mt-2"
                                  >
                                    {savingPrescription ? 'Saving Rx...' : 'Generate & Confirm Prescription'}
                                  </button>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-600">No medicines added to builder sheet.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* AI Assistant Output Card */}
                  {aiDisclaimer && (
                    <div className="border-t border-white/5 pt-4 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 animate-pulse text-purple-400" /> MEDIBRIDGE AI Assistant Insights
                        </span>
                        <button onClick={() => { setAiDisclaimer(false); setAiResult(null); }} className="text-[9px] text-slate-500 hover:text-slate-300">Close Panel</button>
                      </div>

                      {aiLoading ? (
                        <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                          <span className="text-xs text-slate-400 animate-pulse font-mono">Consulting clinical database...</span>
                        </div>
                      ) : aiResult ? (
                        <div className="p-4 bg-purple-950/10 border border-purple-500/20 rounded-xl text-xs text-slate-300 space-y-3 font-sans">
                          <p className="whitespace-pre-wrap leading-relaxed">{aiResult}</p>
                          <div className="flex items-start gap-1.5 text-[9px] text-slate-500 border-t border-white/5 pt-2 font-mono">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                            <span>This information is educational and not a substitute for professional medical advice.</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass-card p-12 text-center text-slate-500 rounded-2xl border border-white/5 py-32">
                  <User className="w-10 h-10 mx-auto mb-2 text-slate-600 animate-pulse" />
                  <p className="text-xs font-semibold">Ready for consultation</p>
                  <p className="text-[10px] text-slate-600 mt-1">Select an active patient from the queue layout on the left to review metrics and documentation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
