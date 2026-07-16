import React from 'react';
import { Screening } from '../../types';
import { ScreeningSummaryCard } from './ScreeningSummaryCard';
import { ClinicalRecommendationCard } from './ClinicalRecommendationCard';
import { FollowupCard } from './FollowupCard';
import { TrendingUp, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PatientTimelineProps {
  screenings: Screening[];
}

export const PatientTimeline: React.FC<PatientTimelineProps> = ({ screenings }) => {
  if (screenings.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 italic text-xs font-mono">
        No rural diagnostic screening records found.
      </div>
    );
  }

  // Sort newest first
  const sortedScreenings = [...screenings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="relative border-l border-white/5 pl-4 ml-2 space-y-6 font-sans text-left">
      {sortedScreenings.map((scr, idx) => {
        const dateStr = new Date(scr.createdAt).toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        // Calculate Hb progress trend if this is Anemia screening and there is a previous record
        let progressTrend: { text: string; direction: 'up' | 'down' | 'none' } | null = null;
        if (scr.screeningType === 'Anemia' && scr.readings.hemoglobin !== undefined) {
          // Find the next oldest anemia screening (it would be further down in the sorted array)
          const olderScreening = sortedScreenings.slice(idx + 1).find(
            s => s.screeningType === 'Anemia' && s.readings.hemoglobin !== undefined
          );

          if (olderScreening && olderScreening.readings.hemoglobin !== undefined) {
            const currentHb = scr.readings.hemoglobin;
            const prevHb = olderScreening.readings.hemoglobin;
            const diff = currentHb - prevHb;
            if (diff > 0) {
              progressTrend = {
                text: `Improving (Hb: ${prevHb} → ${currentHb}, +${diff.toFixed(1)} g/dL)`,
                direction: 'up',
              };
            } else if (diff < 0) {
              progressTrend = {
                text: `Decreasing (Hb: ${prevHb} → ${currentHb}, ${diff.toFixed(1)} g/dL)`,
                direction: 'down',
              };
            } else {
              progressTrend = {
                text: `Stable (Hb: ${prevHb} → ${currentHb})`,
                direction: 'none',
              };
            }
          }
        }

        // Determine Visual Care Status
        let visualStatus: { label: string; colorClass: string; icon: React.ReactNode } = {
          label: 'Stable',
          colorClass: 'bg-[#1e293b]/60 text-slate-400 border border-white/5',
          icon: <Minus className="w-3 h-3" />
        };

        const now = new Date();
        const isMissedFollowup = scr.status === 'reviewed' && scr.followUpStatus === 'pending' && scr.followUpDate && new Date(scr.followUpDate) < now;
        const needsReview = (scr.status === 'pending' && (scr.riskClassifications.overall === 'HIGH' || scr.riskClassifications.overall === 'CRITICAL')) || isMissedFollowup;

        if (needsReview) {
          visualStatus = {
            label: 'Needs Immediate Review',
            colorClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse font-bold',
            icon: <AlertCircle className="w-3 h-3 text-rose-400" />
          };
        } else if (progressTrend) {
          if (progressTrend.direction === 'up') {
            visualStatus = {
              label: 'Improving',
              colorClass: 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 font-bold',
              icon: <TrendingUp className="w-3 h-3 text-emerald-450" />
            };
          } else if (progressTrend.direction === 'down') {
            visualStatus = {
              label: 'Needs Immediate Review',
              colorClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse font-bold',
              icon: <AlertCircle className="w-3 h-3 text-rose-400" />
            };
          } else {
            visualStatus = {
              label: 'Stable',
              colorClass: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold',
              icon: <Minus className="w-3 h-3 text-cyan-400" />
            };
          }
        } else if (scr.riskClassifications.overall === 'HIGH' || scr.riskClassifications.overall === 'CRITICAL') {
          visualStatus = {
            label: 'Needs Immediate Review',
            colorClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold',
            icon: <AlertCircle className="w-3 h-3 text-rose-400" />
          };
        } else if (scr.riskClassifications.overall === 'LOW') {
          visualStatus = {
            label: 'Stable',
            colorClass: 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20 font-bold',
            icon: <CheckCircle2 className="w-3 h-3 text-emerald-450" />
          };
        }

        return (
          <div key={scr.id} className="relative">
            {/* Timeline bullet */}
            <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-500 border border-slate-950 shadow-glow-cyan" />

            <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                <div>
                  <span className="text-xs font-bold text-slate-200">
                    {scr.screeningType}
                  </span>
                  <span className="text-[9px] text-slate-550 font-mono block mt-0.5">
                    Record ID: {scr.id} • Screening Date: {dateStr}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Visual Status Tag */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[9px] font-mono border ${visualStatus.colorClass}`}>
                    {visualStatus.icon}
                    <span>{visualStatus.label}</span>
                  </div>

                  {progressTrend && (
                    <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                      progressTrend.direction === 'up'
                        ? 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20'
                        : progressTrend.direction === 'down'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-slate-550/10 text-slate-400 border border-slate-550/20'
                    }`}>
                      <span>{progressTrend.text}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Care Journey Flow Stepper */}
              <div className="flex items-center justify-between w-full max-w-lg mx-auto py-2.5 px-1 text-[9px] text-slate-500 border-b border-white/5 pb-4 font-mono">
                {/* 1. Screened */}
                <div className="flex flex-col items-center gap-1 flex-1 relative">
                  <div className="w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold text-[10px]">1</div>
                  <span className="text-cyan-400 font-bold">Screened</span>
                  <div className="absolute top-2.5 left-[60%] right-[-40%] h-0.5 bg-cyan-500" />
                </div>
                
                {/* 2. Reviewed */}
                <div className="flex flex-col items-center gap-1 flex-1 relative">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    scr.status === 'reviewed' ? 'bg-cyan-500 text-black' : 'bg-[#0f172a] text-slate-600 border border-white/5'
                  }`}>2</div>
                  <span className={scr.status === 'reviewed' ? 'text-cyan-400 font-bold' : ''}>Reviewed</span>
                  <div className={`absolute top-2.5 left-[60%] right-[-40%] h-0.5 ${
                    scr.status === 'reviewed' ? 'bg-cyan-500' : 'bg-slate-800'
                  }`} />
                </div>

                {/* 3. Action Started (Medication) */}
                <div className="flex flex-col items-center gap-1 flex-1 relative">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    scr.actionTaken ? 'bg-cyan-500 text-black' : 'bg-[#0f172a] text-slate-600 border border-white/5'
                  }`}>3</div>
                  <span className={scr.actionTaken ? 'text-cyan-400 font-bold' : ''}>Medication</span>
                  <div className={`absolute top-2.5 left-[60%] right-[-40%] h-0.5 ${
                    scr.actionTaken ? 'bg-cyan-500' : 'bg-slate-800'
                  }`} />
                </div>

                {/* 4. Follow-up Scheduled */}
                <div className="flex flex-col items-center gap-1 flex-1 relative">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    scr.followUpDate ? 'bg-cyan-500 text-black' : 'bg-[#0f172a] text-slate-600 border border-white/5'
                  }`}>4</div>
                  <span className={scr.followUpDate ? 'text-cyan-400 font-bold' : ''}>Follow-up</span>
                  <div className={`absolute top-2.5 left-[60%] right-[-40%] h-0.5 ${
                    scr.followUpStatus === 'completed' || progressTrend?.direction === 'up' ? 'bg-cyan-500' : 'bg-slate-800'
                  }`} />
                </div>

                {/* 5. Improved / Resolved */}
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    scr.followUpStatus === 'completed' || progressTrend?.direction === 'up' ? 'bg-cyan-500 text-black' : 'bg-[#0f172a] text-slate-600 border border-white/5'
                  }`}>5</div>
                  <span className={scr.followUpStatus === 'completed' || progressTrend?.direction === 'up' ? 'text-emerald-450 font-bold' : ''}>Resolved</span>
                </div>
              </div>

              {/* Dynamic screening summary displaying vitals */}
              <ScreeningSummaryCard screening={scr} />

              {/* Clinical recommendations guidelines */}
              <ClinicalRecommendationCard screening={scr} />

              {/* Doctor follow-up evaluation review directives */}
              <FollowupCard screening={scr} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default PatientTimeline;
