import React, { useState, useEffect } from 'react';
import { 
  Search, Check, AlertCircle, RefreshCw, 
  ClipboardList, Clock, User, PlusCircle, ShieldAlert, Heart, TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import adminService from '../services/adminService';
import screeningService from '../services/screeningService';
import { Screening, User as UserType } from '../types';
import { MetricCard } from '../components/cards/MetricCard';
import { RiskEngine } from '../clinicalRules';

export const ChwDashboard: React.FC = () => {
  const { addNotification } = useApp();
  const [patients, setPatients] = useState<UserType[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab State: 'history' | 'new-screening'
  const [activeTab, setActiveTab] = useState<'new-screening' | 'history'>('new-screening');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (systolic && (isNaN(sysNum) || sysNum < 60 || sysNum > 240)) {
      setBpWarning('Systolic pressure typically ranges from 60 to 240 mmHg.');
    } else if (diastolic && (isNaN(diaNum) || diaNum < 40 || diaNum > 140)) {
      setBpWarning('Diastolic pressure typically ranges from 40 to 140 mmHg.');
    } else if (systolic && diastolic && sysNum <= diaNum) {
      setBpWarning('Systolic must be higher than diastolic.');
    } else {
      setBpWarning(null);
    }
  }, [systolic, diastolic]);

  useEffect(() => {
    const bsNum = parseInt(bloodSugar, 10);
    if (bloodSugar && (isNaN(bsNum) || bsNum < 30 || bsNum > 600)) {
      setBsWarning('Blood glucose typically ranges from 30 to 600 mg/dL.');
    } else {
      setBsWarning(null);
    }
  }, [bloodSugar]);

  useEffect(() => {
    const hemNum = parseFloat(hemoglobin);
    if (hemoglobin && (isNaN(hemNum) || hemNum < 3 || hemNum > 22)) {
      setHemoWarning('Hemoglobin level typically ranges from 3.0 to 22.0 g/dL.');
    } else {
      setHemoWarning(null);
    }
  }, [hemoglobin]);

  // Real-time Risk Classifications
  const calculateLiveRisk = () => {
    const readings: any = {
      systolic: systolic ? parseInt(systolic, 10) : undefined,
      diastolic: diastolic ? parseInt(diastolic, 10) : undefined,
      bloodSugar: bloodSugar ? parseInt(bloodSugar, 10) : undefined,
      bloodSugarType,
      hemoglobin: hemoglobin ? parseFloat(hemoglobin) : undefined,
      isPregnant,
      trimester: trimester ? parseInt(trimester, 10) : undefined,
      ageGroup,
      weight: weight ? parseFloat(weight) : undefined,
      ifaStarted,
      tbSymptoms: [
        ...(cough ? ['Cough > 2 weeks'] : []),
        ...(fever ? ['Fever'] : []),
        ...(nightSweats ? ['Night Sweats'] : []),
        ...(weightLoss ? ['Unexplained Weight Loss'] : []),
      ]
    };
    return RiskEngine.calculateRisk(screeningType, readings);
  };

  const liveRisk = calculateLiveRisk();

  // Reset form inputs
  const resetForm = () => {
    setSelectedPatientId('');
    setSystolic('');
    setDiastolic('');
    setBloodSugar('');
    setHemoglobin('');
    setIsPregnant(false);
    setTrimester('');
    setAgeGroup('adult');
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

  // Submit Screening Form
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

      setScreenings(prev => [res, ...prev]);
      setSuccessMsg(`Screening successfully saved for ${targetPatient.name}. Vitals triage is pending clinician evaluation.`);
      addNotification(
        'Vitals Uploaded',
        `Triage file submitted for patient ${targetPatient.name}. Vitals: ${screeningType}.`,
        'general'
      );
      resetForm();
      setActiveTab('history');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit screening vitals.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter patients list based on search term
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // Operations Metrics Calculations
  const uniquePatients = new Set(screenings.map(s => s.patientId)).size;
  const anemiaCases = screenings.filter(s => s.screeningType === 'Anemia' && s.riskClassifications.overall !== 'LOW').length;
  const highRiskCount = screenings.filter(s => s.riskClassifications.overall === 'HIGH' || s.riskClassifications.overall === 'CRITICAL').length;
  const improvingCount = screenings.filter(s => {
    if (s.screeningType !== 'Anemia' || s.readings.hemoglobin === undefined) return false;
    const older = screenings.find(o => o.patientId === s.patientId && o.screeningType === 'Anemia' && new Date(o.createdAt).getTime() < new Date(s.createdAt).getTime() && o.readings.hemoglobin !== undefined);
    return older && (s.readings.hemoglobin! > older.readings.hemoglobin!);
  }).length;
  const pendingFollowUps = screenings.filter(s => s.status === 'reviewed' && s.followUpStatus === 'pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-450 flex items-start gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-450 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header bar with view toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans">Rural Telemetry & Screenings</h2>
          <p className="text-xs text-slate-400 mt-1">
            Conduct rural health campaigns, triage chronic NCD risks, and review local caseload histories.
          </p>
        </div>

        <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-white/5 w-fit">
          <button
            onClick={() => setActiveTab('new-screening')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'new-screening'
                ? 'bg-[#1e293b] text-cyan-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" /> New Screening
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#1e293b] text-emerald-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" /> Case History
          </button>
        </div>
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard
          title="People Screened"
          value={`${uniquePatients} villagers`}
          subtext="Total unique patients triaged"
          icon={<User className="w-4 h-4" />}
          accentColor="cyan"
        />
        <MetricCard
          title="Anemia Cases"
          value={`${anemiaCases} cases`}
          subtext="Vitals indicating anemia severity"
          icon={<Heart className="w-4 h-4" />}
          accentColor="rose"
        />
        <MetricCard
          title="High Risk Alerts"
          value={`${highRiskCount} cases`}
          subtext="Critical or High risk priority cases"
          icon={<ShieldAlert className="w-4 h-4" />}
          accentColor="rose"
        />
        <MetricCard
          title="Improving Trends"
          value={`${improvingCount} patients`}
          subtext="Showed Hb improvement on follow-up"
          icon={<TrendingUp className="w-4 h-4" />}
          accentColor="emerald"
        />
        <MetricCard
          title="Pending Follow-ups"
          value={`${pendingFollowUps} review alerts`}
          subtext="Provider reviewed cases to follow up"
          icon={<Clock className="w-4 h-4" />}
          accentColor="slate"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-sans text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2.5" /> Loading workspace records...
        </div>
      ) : activeTab === 'new-screening' ? (
        /* ================= NEW SCREENING FORM WORKFLOW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
                  <option value="NCD">Other Chronic NCD (Coming Soon)</option>
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
                              ? 'bg-cyan-500/10 text-cyan-400' 
                              : 'hover:bg-white/[0.02] text-slate-300'
                          }`}
                        >
                          <span className="font-semibold">{p.name} {p.villageId ? `(${p.villageId === 'vil_01' ? 'Rampur' : p.villageId === 'vil_02' ? 'Lakshmipur' : 'Devgaon'})` : ''}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{p.id}</span>
                        </button>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-500 p-2 italic text-center">No patients found</p>
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
                      className="text-[9px] font-bold text-rose-450 hover:underline uppercase"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>

              {/* Dynamic Vitals Input Blocks */}
              {screeningType === 'Hypertension/Diabetes' && (
                <div className="space-y-4">
                  {/* Blood Pressure Inputs */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-1">
                      Blood Pressure (mmHg)
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Systolic (Top Number)</label>
                      <input
                        type="number"
                        placeholder="e.g. 120"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                        className={`w-full bg-[#0b1120] border rounded-lg py-2.5 px-3 text-xs text-slate-200 focus:outline-none ${
                          bpWarning ? 'border-amber-500/50 focus:border-amber-400' : 'border-white/5 focus:border-cyan-400'
                        }`}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Diastolic (Bottom Number)</label>
                      <input
                        type="number"
                        placeholder="e.g. 80"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        className={`w-full bg-[#0b1120] border rounded-lg py-2.5 px-3 text-xs text-slate-200 focus:outline-none ${
                          bpWarning ? 'border-amber-500/50 focus:border-amber-400' : 'border-white/5 focus:border-cyan-400'
                        }`}
                        required
                      />
                    </div>
                    {bpWarning && (
                      <div className="col-span-2 text-[10px] text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{bpWarning}</span>
                      </div>
                    )}
                  </div>

                  {/* Blood Sugar Inputs */}
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-1">
                      Blood Glucose (mg/dL)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Glucose Reading</label>
                        <input
                          type="number"
                          placeholder="e.g. 104"
                          value={bloodSugar}
                          onChange={(e) => setBloodSugar(e.target.value)}
                          className={`w-full bg-[#0b1120] border rounded-lg py-2.5 px-3 text-xs text-slate-200 focus:outline-none ${
                            bsWarning ? 'border-amber-500/50 focus:border-amber-400' : 'border-white/5 focus:border-cyan-400'
                          }`}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Reading Context</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setBloodSugarType('random')}
                            className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                              bloodSugarType === 'random'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                : 'bg-[#0b1120] text-slate-400 border-white/5 hover:bg-white/[0.01]'
                            }`}
                          >
                            Random
                          </button>
                          <button
                            type="button"
                            onClick={() => setBloodSugarType('fasting')}
                            className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                              bloodSugarType === 'fasting'
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                : 'bg-[#0b1120] text-slate-400 border-white/5 hover:bg-white/[0.01]'
                            }`}
                          >
                            Fasting
                          </button>
                        </div>
                      </div>
                    </div>
                    {bsWarning && (
                      <div className="text-[10px] text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{bsWarning}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {screeningType === 'Anemia' && (
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-1.5">
                    Anemia Clinical Telemetry Intake
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Hemoglobin Level (g/dL)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 10.4"
                        value={hemoglobin}
                        onChange={(e) => setHemoglobin(e.target.value)}
                        className={`w-full bg-[#0b1120] border rounded-lg py-2.5 px-3 text-xs text-slate-200 focus:outline-none ${
                          hemoWarning ? 'border-amber-500/50' : 'border-white/5 focus:border-cyan-400'
                        }`}
                        required
                      />
                      {hemoWarning && (
                        <div className="text-[10px] text-amber-400 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{hemoWarning}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Age Category</label>
                      <select
                        value={ageGroup === 'adult' && isPregnant ? 'adult_pregnant' : ageGroup}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'adult_pregnant') {
                            setIsPregnant(true);
                            setAgeGroup('adult');
                          } else {
                            setIsPregnant(false);
                            setTrimester('');
                            setAgeGroup(val as any);
                          }
                        }}
                        className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2.5 px-3 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="child">Child (6-59 months)</option>
                        <option value="adolescent">Adolescent (12-14 years)</option>
                        <option value="adult">Adult Non-Pregnant</option>
                        <option value="adult_pregnant">Adult Pregnant</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 col-span-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Body Weight (kg)</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="e.g. 54"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2.5 px-3 text-xs text-slate-200 focus:outline-none"
                        required
                      />
                    </div>

                    {isPregnant && ageGroup === 'adult' && (
                      <div className="space-y-1.5 col-span-1 animate-fadeIn">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Trimester</label>
                        <select
                          value={trimester}
                          onChange={(e) => setTrimester(e.target.value)}
                          className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2.5 px-3 text-xs text-slate-250 focus:outline-none"
                          required
                        >
                          <option value="">Select Trimester</option>
                          <option value="1">1st Trimester</option>
                          <option value="2">2nd Trimester</option>
                          <option value="3">3rd Trimester</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-1.5 col-span-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block">IFA Started?</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setIfaStarted(true)}
                          className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                            ifaStarted
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : 'bg-[#0b1120] text-slate-450 border-white/5 hover:bg-white/[0.01]'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIfaStarted(false)}
                          className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                            !ifaStarted
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : 'bg-[#0b1120] text-slate-450 border-white/5 hover:bg-white/[0.01]'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {screeningType === 'Tuberculosis' && (
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-1">
                    TB Symptom Burden Checklist
                  </div>
                  <div className="space-y-2 text-xs text-slate-350">
                    <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-900/40 border border-white/5 rounded-lg hover:bg-slate-900/60">
                      <input
                        type="checkbox"
                        checked={cough}
                        onChange={(e) => setCough(e.target.checked)}
                        className="rounded border-white/10 bg-slate-850 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                      />
                      <span>Persistent Cough (&gt; 2 weeks)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-900/40 border border-white/5 rounded-lg hover:bg-slate-900/60">
                      <input
                        type="checkbox"
                        checked={fever}
                        onChange={(e) => setFever(e.target.checked)}
                        className="rounded border-white/10 bg-slate-850 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                      />
                      <span>Unexplained Recurrent Fever</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-900/40 border border-white/5 rounded-lg hover:bg-slate-900/60">
                      <input
                        type="checkbox"
                        checked={nightSweats}
                        onChange={(e) => setNightSweats(e.target.checked)}
                        className="rounded border-white/10 bg-slate-850 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                      />
                      <span>Profuse Night Sweats</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-900/40 border border-white/5 rounded-lg hover:bg-slate-900/60">
                      <input
                        type="checkbox"
                        checked={weightLoss}
                        onChange={(e) => setWeightLoss(e.target.checked)}
                        className="rounded border-white/10 bg-slate-850 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                      />
                      <span>Unexplained Significant Weight Loss</span>
                    </label>
                  </div>
                </div>
              )}

              {screeningType === 'NCD' && (
                <div className="p-6 rounded-xl border border-white/5 bg-[#0b1120]/40 text-center text-xs text-slate-500 italic">
                  Additional NCD Screening Modules (Cancer risks, COPD, Asthma) are coming soon in next release.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedPatientId || screeningType === 'NCD'}
                className="glass-btn-primary w-full py-3 text-xs font-semibold"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving records...
                  </span>
                ) : (
                  <span>Submit Screening Records</span>
                )}
              </button>
            </form>
          </div>

          {/* Right Panel: Automatic Risk Classification (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Color Coded Risk Card */}
            <div className={`p-6 rounded-2xl border text-center transition-all ${
              liveRisk.overall === 'CRITICAL'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-450 shadow-glow-rose'
                : liveRisk.overall === 'HIGH'
                ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 shadow-glow-orange'
                : liveRisk.overall === 'MODERATE'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-glow-amber'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450 shadow-glow-emerald'
            }`}>
              <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-500">Live Calculated Risk</span>
              <span className="text-3xl font-black block mt-2 tracking-tight uppercase">
                {liveRisk.overall}
              </span>
              <span className="text-[9px] font-extrabold uppercase bg-white/5 px-2.5 py-1 rounded-full inline-block mt-2 tracking-wide text-slate-300">
                {screeningType}
              </span>
              <div className="mt-6 border-t border-white/5 pt-4 text-left space-y-3 text-[11px] text-slate-350">
                {screeningType === 'Hypertension/Diabetes' && (
                  <>
                    <div className="flex justify-between items-center pb-1">
                      <span>Hypertension Risk:</span>
                      <span className={`font-bold ${
                        liveRisk.riskClassifications.hypertension === 'Crisis' ? 'text-rose-455' : 
                        liveRisk.riskClassifications.hypertension === 'Stage 2' ? 'text-orange-400' :
                        liveRisk.riskClassifications.hypertension === 'Stage 1' ? 'text-amber-400' : 'text-emerald-450'
                      }`}>
                        {liveRisk.riskClassifications.hypertension || 'Normal'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                      <span>Diabetes Risk:</span>
                      <span className={`font-bold ${
                        liveRisk.riskClassifications.diabetes === 'Diabetes' ? 'text-rose-455' : 
                        liveRisk.riskClassifications.diabetes === 'Prediabetes' ? 'text-amber-400' : 'text-emerald-450'
                      }`}>
                        {liveRisk.riskClassifications.diabetes || 'Normal'}
                      </span>
                    </div>
                  </>
                )}
                {screeningType === 'Anemia' && (
                  <div className="flex justify-between items-center pb-1">
                    <span>Anemia Severity:</span>
                    <span className={`font-bold ${
                      liveRisk.riskClassifications.anemia === 'Severe' ? 'text-rose-455' : 
                      liveRisk.riskClassifications.anemia === 'Moderate' ? 'text-orange-450' :
                      liveRisk.riskClassifications.anemia === 'Mild' ? 'text-amber-450' : 'text-emerald-450'
                    }`}>
                      {liveRisk.riskClassifications.anemia || 'Normal'}
                    </span>
                  </div>
                )}
                {screeningType === 'Tuberculosis' && (
                  <div className="flex justify-between items-center pb-1">
                    <span>TB Triage Status:</span>
                    <span className={`font-bold ${
                      liveRisk.riskClassifications.overall === 'HIGH' ? 'text-rose-455 font-black' :
                      liveRisk.riskClassifications.overall === 'MODERATE' ? 'text-amber-400' : 'text-emerald-450'
                    }`}>
                      {liveRisk.riskClassifications.tb || 'Low Risk'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Reference Ranges Card */}
            <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-2">Triage Diagnostic Guideline</h4>
              <div className="space-y-2 text-[10px] text-slate-500 font-mono leading-relaxed">
                <p className="text-slate-400"><strong className="text-slate-300">Hypertension Criteria:</strong><br/>Normal: &lt;120/80 mmHg<br/>Stage 1: 140-159 / 90-99 mmHg<br/>Stage 2: 160+ / 100+ mmHg<br/>Crisis: 180+ / 110+ mmHg</p>
                <p className="text-slate-400 mt-2"><strong className="text-slate-300">Diabetes Criteria Fasting/Random:</strong><br/>Normal: &lt;100 / &lt;140 mg/dL<br/>Prediabetes: 100-125 / 140-199 mg/dL<br/>Diabetes: 126+ / 200+ mg/dL</p>
                <p className="text-slate-400 mt-2"><strong className="text-slate-300">Anemia WHO Criteria (Hb g/dL):</strong><br/>Pregnant / Child: Normal 11+, Mild 10-10.9, Moderate 7-9.9, Severe &lt;7<br/>Adolescent: Normal 11.5+, Mild 11-11.4, Moderate 8-10.9, Severe &lt;8<br/>Adult: Normal 12+, Mild 11-11.9, Moderate 8-10.9, Severe &lt;8</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= SCREENING HISTORY VIEW ================= */
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
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
                              ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20 animate-pulse'
                              : s.riskClassifications.overall === 'HIGH'
                              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                              : s.riskClassifications.overall === 'MODERATE'
                              ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                          }`}>
                            {s.riskClassifications.overall}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            s.status === 'reviewed' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-amber-500/10 text-amber-400'
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
                            <span className="text-slate-550 italic font-mono">Awaiting provider review</span>
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
