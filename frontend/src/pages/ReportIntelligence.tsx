import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import reportService from '../services/reportService';
import aiService from '../services/aiService';
import { MedicalReport } from '../types';
import { TableSkeleton } from '../components/common/Loader';

export const ReportIntelligence: React.FC = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [processingInsight, setProcessingInsight] = useState(false);
  const [typingStep, setTypingStep] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportService.getReports();
        setReports(data);
        if (data.length > 0) {
          setSelectedReport(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchReports();
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-sans">Report Intelligence</h2>
          <p className="text-xs text-slate-400 mt-1">AI-powered scanning engine that decodes clinical lab reports and extracts semantic insights.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider rounded-full h-fit">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Gemini Clinical Model Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Index list */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 space-y-4 h-fit">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-white/5 pb-2">Diagnostic Reports</h3>
          
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
                    <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{report.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">Uploaded: {new Date(report.uploadDate).toLocaleDateString()}</p>
                      
                      <div className="mt-2.5 flex items-center">
                        {report.status === 'completed' ? (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Ready</span>
                        ) : (
                          <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">Parsing...</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
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
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-sans">AI Clinical Summary</h3>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Parsed</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedReport.parsedInsights.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Critical Findings */}
                  <div className="glass-card p-6 rounded-2xl border border-red-500/10 bg-red-500/[0.01] space-y-4">
                    <div className="flex items-center gap-2 text-rose-400 border-b border-white/5 pb-3">
                      <AlertCircle className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider font-sans">Critical Findings</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {selectedReport.parsedInsights.criticalFindings.map((finding, idx) => (
                        <li key={idx} className="text-xs text-slate-300 font-sans flex items-start gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="glass-card p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.01] space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 border-b border-white/5 pb-3">
                      <CheckCircle2 className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-wider font-sans">Recommendations</h3>
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
