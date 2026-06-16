import React, { useState, useEffect } from 'react';
import { Activity, Heart, Eye, Flame, Moon, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAppMode } from '../context/AppModeContext';
import { MetricCard } from '../components/cards/MetricCard';
import { VitalsAreaChart, RadialAdherenceChart, SleepTelemetryChart } from '../components/charts/AnalyticsCharts';
import { HydrationTracker, StepTracker, MedicationTickOff } from '../components/widgets/HealthWidgets';
import { mockVitalsHistory } from '../services/mockData';
import { CardSkeleton, ChartSkeleton } from '../components/common/Loader';
import aiService from '../services/aiService';

const mockSleepData = [
  { day: 'Mon', hours: 7.2 },
  { day: 'Tue', hours: 6.8 },
  { day: 'Wed', hours: 7.5 },
  { day: 'Thu', hours: 8.0 },
  { day: 'Fri', hours: 7.1 },
  { day: 'Sat', hours: 8.5 },
  { day: 'Sun', hours: 7.4 }
];

export const PatientDashboard: React.FC = () => {
  const { currentUser } = useApp();
  const { mode } = useAppMode();
  const [loading, setLoading] = useState(true);
  const [vitalsData, setVitalsData] = useState(mockVitalsHistory);
  const [activeChart, setActiveChart] = useState<'vitals' | 'sleep'>('vitals');

  // AI states
  const [loadingAI, setLoadingAI] = useState(true);
  const [aiStep, setAiStep] = useState('');
  const [healthInsights, setHealthInsights] = useState<{
    summary: string;
    lifestyleTips: string[];
    healthRisks: string[];
    followUps: string[];
  } | null>(null);
  
  const [riskScoreData, setRiskScoreData] = useState<{
    score: number;
    level: 'Low' | 'Moderate' | 'High' | 'Critical';
    primaryRiskFactors: string[];
    details: string;
  } | null>(null);

  const fetchAIInsights = async () => {
    setLoadingAI(true);
    setAiStep('Auditing blood pressure & heart rate logs...');
    
    const steps = [
      'Checking prescription adherence metrics...',
      'Evaluating somatic parameters & caloric balance...',
      'Formulating wellness recommendations...'
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < steps.length) {
        setAiStep(steps[index]);
        index++;
      }
    }, 800);

    try {
      const historyPayload = {
        patientName: currentUser.name,
        recentVitals: mockVitalsHistory,
        adherence: 85
      };

      const [insights, score] = await Promise.all([
        aiService.generateHealthInsights(historyPayload),
        aiService.calculateRiskScore('Routine tracking check', { heartRate: 72, oxygen: 99 })
      ]);

      clearInterval(interval);
      setHealthInsights(insights);
      setRiskScoreData(score);
    } catch (err) {
      console.error(err);
      clearInterval(interval);
    } finally {
      setLoadingAI(false);
      setAiStep('');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 950);
    fetchAIInsights();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    const handleVitalsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setVitalsData(customEvent.detail);
      }
    };
    const handleDemoRefresh = () => {
      fetchAIInsights();
    };

    window.addEventListener('medibridge-vitals-update', handleVitalsUpdate);
    window.addEventListener('medibridge-demo-refresh', handleDemoRefresh);
    return () => {
      window.removeEventListener('medibridge-vitals-update', handleVitalsUpdate);
      window.removeEventListener('medibridge-demo-refresh', handleDemoRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-slate-850 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <div className="lg:col-span-1"><ChartSkeleton /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans">Welcome Back, {currentUser.name}</h2>
          <p className="text-xs text-slate-400 mt-1">Here is a comprehensive summary of your clinical diagnostics and vitals telemetry.</p>
        </div>
        
        <button 
          onClick={fetchAIInsights} 
          disabled={loadingAI}
          className="glass-btn-secondary py-1.5 px-3.5 text-xs flex items-center gap-1.5 text-slate-300 border border-white/5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingAI ? 'animate-spin' : ''}`} />
          {loadingAI ? 'Scanning...' : 'Refresh AI Analytics'}
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Heart Rate"
          value={`${vitalsData[vitalsData.length - 1]?.heartRate || 72} bpm`}
          subtext="Normal resting rate"
          change={1.2}
          trend="up"
          icon={<Heart className="w-4 h-4" />}
          accentColor="cyan"
        />
        <MetricCard
          title="Blood Pressure"
          value={vitalsData[vitalsData.length - 1]?.bp || "120/80"}
          subtext="Optimal range"
          change={-2.4}
          trend="down"
          icon={<Activity className="w-4 h-4" />}
          accentColor="emerald"
        />
        <MetricCard
          title="Blood Oxygen"
          value={`${vitalsData[vitalsData.length - 1]?.oxygen || 99}%`}
          subtext="SpO2 normal"
          change={0.1}
          trend="up"
          icon={<Eye className="w-4 h-4" />}
          accentColor="cyan"
        />
        <MetricCard
          title="Sleep Tracker"
          value="7.4 hrs"
          subtext="Deep: 2.2 hrs"
          change={8.5}
          trend="up"
          icon={<Moon className="w-4 h-4 text-purple-400" />}
          accentColor="slate"
        />
        <MetricCard
          title="Caloric Burn"
          value="340 kcal"
          subtext="Target: 500 kcal"
          change={4.8}
          trend="up"
          icon={<Flame className="w-4 h-4" />}
          accentColor="emerald"
        />
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-white/5 w-fit">
            <button
              onClick={() => setActiveChart('vitals')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                activeChart === 'vitals'
                  ? 'bg-[#1e293b] text-cyan-400 border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vitals History
            </button>
            <button
              onClick={() => setActiveChart('sleep')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                activeChart === 'sleep'
                  ? 'bg-[#1e293b] text-purple-400 border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sleep Telemetry
            </button>
          </div>

          {activeChart === 'vitals' ? (
            <VitalsAreaChart data={vitalsData} title="Daily Vitals History" />
          ) : (
            <SleepTelemetryChart data={mockSleepData} title="Weekly Sleep Telemetry" />
          )}
        </div>
        <div className="lg:col-span-1">
          <RadialAdherenceChart value={85} title="Medication Adherence" subtitle="Daily compliance rate" />
        </div>
      </div>

      {/* Visual Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StepTracker />
        <HydrationTracker />
        <MedicationTickOff />
      </div>

      {/* AI Intelligence Workspace section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wellness Insights */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-2.5 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-sans flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> AI Health Intelligence Insights
              </h3>
              <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Active</span>
            </div>

            {loadingAI ? (
              <div className="p-6 rounded-xl border border-cyan-500/10 bg-cyan-500/[0.01] flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                <div>
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Wellness Diagnostics Scan</h4>
                  <p className="text-[10px] text-slate-500 animate-pulse mt-0.5">{aiStep}</p>
                </div>
              </div>
            ) : healthInsights ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{healthInsights.summary}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Lifestyle Recommendations</span>
                    <ul className="space-y-1.5 text-[10px] text-slate-400 font-sans">
                      {healthInsights.lifestyleTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-450 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Clinical Follow-Ups</span>
                    <ul className="space-y-1.5 text-[10px] text-slate-400 font-sans">
                      {healthInsights.followUps.map((fu, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-cyan-450 flex-shrink-0 mt-0.5" />
                          <span>{fu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5 flex items-start gap-2 text-[9px] text-slate-550 font-mono mt-4">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>This information is educational and not a substitute for professional medical advice.</span>
          </div>
        </div>

        {/* Triage Safety Risk Gauge */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-sans border-b border-white/5 pb-2.5">Triage Safety Risk Indicator</h3>
            
            {loadingAI ? (
              <div className="h-48 bg-slate-850 rounded-xl animate-pulse" />
            ) : riskScoreData ? (
              <div className="space-y-4 text-center font-sans">
                <div className={`p-4 rounded-xl border ${
                  riskScoreData.level === 'Critical'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                    : riskScoreData.level === 'Moderate' || riskScoreData.level === 'High'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-450'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450'
                }`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-500">Calculated Risk Score</span>
                  <span className="text-2xl font-black block mt-1">{riskScoreData.score}/100</span>
                  <span className="text-[10px] font-extrabold uppercase block tracking-wider mt-1">{riskScoreData.level} Level</span>
                </div>

                <div className="text-left space-y-2 bg-white/[0.01] p-3 rounded-xl border border-white/5 text-[10px]">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Risk Factors Identified</span>
                  <ul className="space-y-1 list-disc list-inside text-slate-400 font-mono">
                    {riskScoreData.primaryRiskFactors.map((rf, i) => (
                      <li key={i}>{rf}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          {!loadingAI && riskScoreData && (
            <p className="text-[10px] text-slate-500 italic font-sans mt-4 border-t border-white/5 pt-2">
              {riskScoreData.details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
