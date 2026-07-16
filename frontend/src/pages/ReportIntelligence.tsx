import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, CheckCircle2, AlertCircle, ArrowRight, User } from 'lucide-react';
import reportService from '../services/reportService';
import aiService from '../services/aiService';
import { MedicalReport } from '../types';
import { TableSkeleton } from '../components/common/Loader';
import { useApp } from '../context/AppContext';

export const ReportIntelligence: React.FC = () => {
  const { currentUser } = useApp();
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [processingInsight, setProcessingInsight] = useState(false);
  const [typingStep, setTypingStep] = useState('');

  const fetchReports = async () => {
    try {
      setLoadingList(true);
      const data = await reportService.getReports();
      let filtered = data;
      if (currentUser.role === 'patient') {
        // Patients should only see their own uploaded reports
        filtered = data.filter(r => r.patientId === currentUser.id);
      }
      setReports(filtered);
      if (filtered.length > 0) {
        setSelectedReport(filtered[0]);
      } else {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentUser]);

  useEffect(() => {
    const handleDemoRefresh = () => {
      fetchReports();
    };
    window.addEventListener('medibridge-demo-refresh', handleDemoRefresh);
    return () => window.removeEventListener('medibridge-demo-refresh', handleDemoRefresh);
  }, []);

  const handleSelectReport = async (report: MedicalReport) => {
    setSelectedReport(report);
    if (report.status === 'processing') {
      setProcessingInsight(true);
      setTypingStep('Scanning report metadata & title descriptors...');
      
      const steps = [
        'Decoding physiological indicators and reference boundaries...',
        'Compiling wellness directives and recommendations...'
      ];

      let stepIndex = 0;
      const interval = setInterval(() => {
        if (stepIndex < steps.length) {
          setTypingStep(steps[stepIndex]);
          stepIndex++;
        }
      }, 900);

      try {
        const res = await aiService.analyzeMedicalReport(
          report.title,
          report.parsedInsights?.summary || 'Routine laboratory testing report.'
        );

        clearInterval(interval);
        
        const updated = {
          ...report,
          status: 'completed' as const,
          parsedInsights: {
            summary: res.summary,
            criticalFindings: res.keyMetrics.map(m => `${m.name}: ${m.value} (${m.status})`),
            recommendations: res.recommendations
          }
        };
        
        setReports(prev => prev.map(r => r.id === report.id ? updated : r));
        setSelectedReport(updated);
      } catch (err) {
        console.error(err);
        clearInterval(interval);
      } finally {
        setProcessingInsight(false);
        setTypingStep('');
      }
    } else {
      setProcessingInsight(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans">
            {currentUser.role === 'doctor' ? 'Clinical Report Analyzer' : 'Report Intelligence'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentUser.role === 'doctor'
              ? 'Triage patient lab records, inspect flagged out-of-bound parameters, and review AI Clinical Focus points.'
              : 'AI-powered scanning engine that decodes clinical lab reports and extracts semantic insights.'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider rounded-full h-fit">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Gemini Clinical Model Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Index list */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 space-y-4 h-fit">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-white/5 pb-2">
            {currentUser.role === 'doctor' ? 'Patient Laboratory Reports' : 'My Diagnostic Reports'}
          </h3>
          
          {loadingList ? (
            <div className="space-y-3">
              <div className="h-12 bg-slate-850 rounded animate-pulse" />
              <div className="h-12 bg-slate-850 rounded animate-pulse" />
            </div>
          ) : (
            <div className="space-y-2.5">
              {reports.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                return (
                  <button
                    key={report.id}
                    onClick={() => handleSelectReport(report)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white/5 border-cyan-500/30 shadow-glow-cyan'
                        : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="p-2 bg-white/5 rounded-lg text-slate-450 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 font-sans text-xs">
                      <h4 className="font-bold text-slate-200 truncate">{report.title}</h4>
                      {currentUser.role === 'doctor' && (
                        <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">Patient: {report.patientName}</p>
                      )}
                      <p className="text-[9px] text-slate-500 mt-1">Uploaded: {new Date(report.uploadDate).toLocaleDateString()}</p>
                      
                      <div className="mt-2.5">
                        {report.status === 'completed' ? (
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Ready</span>
                        ) : (
                          <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">Parsing...</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              {reports.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-6">No diagnostic reports logged.</p>
              )}
            </div>
          )}
        </div>

        {/* Detailed Insights */}
        <div className="lg:col-span-2 space-y-6">
          {selectedReport ? (
            selectedReport.status === 'processing' || processingInsight ? (
              <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
                <div className="flex items-center gap-3 text-cyan-400">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">AI Medical Parser Active</h3>
                </div>
                <p className="text-xs text-slate-400 font-mono leading-relaxed animate-pulse">
                  {typingStep || 'The semantic layout analysis engine is mapping diagnostic findings and verifying physiological indicators against target ranges...'}
                </p>
                <TableSkeleton rows={3} />
              </div>
            ) : selectedReport.parsedInsights ? (
              <div className="space-y-6">
                
                {/* Clinician Patient Header Summary */}
                <div className="glass-card p-4 rounded-xl border border-white/5 flex items-center gap-3.5 font-sans text-xs">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center font-bold text-black select-none text-sm">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-550 uppercase tracking-wider font-bold block">Subject Patient Record</span>
                    <span className="font-bold text-slate-200 block text-xs mt-0.5">{selectedReport.patientName}</span>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Report ID</span>
                    <span className="font-mono text-[9px] text-slate-455 block mt-0.5">{selectedReport.id}</span>
                  </div>
                </div>

                {/* AI Focus Summary Cards for Doctor */}
                <div className="glass-card p-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.01] space-y-3.5 font-sans text-xs">
                  <div className="flex items-center gap-2 text-amber-400 border-b border-white/5 pb-2.5">
                    <Sparkles className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Clinical Focus Summary</h3>
                  </div>
                  <div className="text-slate-300 leading-normal">
                    <p className="mb-2.5">Doctor, please focus on the following key metrics extracted from the patient's lab report:</p>
                    <ul className="space-y-2">
                      {selectedReport.parsedInsights.criticalFindings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-350">
                          <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="font-semibold text-amber-350">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Grid layout for Details and Advice */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* full summary text */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-2 text-cyan-400 border-b border-white/5 pb-3">
                      <FileText className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider font-sans">Full Report Summary</h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedReport.parsedInsights.summary}</p>
                  </div>

                  {/* recommendations */}
                  <div className="glass-card p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.01] space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 border-b border-white/5 pb-3">
                      <CheckCircle2 className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider font-sans">Actionable Advice</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {selectedReport.parsedInsights.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-xs text-slate-300 font-sans flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center text-slate-500 min-h-[300px]">
                <AlertCircle className="w-10 h-10 mb-2 text-slate-600" />
                <p className="text-xs font-medium">No Insights Found</p>
                <p className="text-[10px] text-slate-600 mt-1">This report does not contain any structured insights.</p>
              </div>
            )
          ) : (
            <div className="glass-card p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center text-slate-500 min-h-[300px]">
              <Sparkles className="w-10 h-10 mb-2 text-slate-600 animate-pulse" />
              <p className="text-xs font-medium">Select a Report</p>
              <p className="text-[10px] text-slate-600 mt-1">Select a diagnostic report from the left panel to load clinical insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ReportIntelligence;
