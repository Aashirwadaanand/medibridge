import React from 'react';
import { Screening } from '../../types';
import { Clock, CheckCircle } from 'lucide-react';

interface FollowupCardProps {
  screening: Screening;
}

export const FollowupCard: React.FC<FollowupCardProps> = ({ screening }) => {
  const { status, doctorName, doctorNotes, actionTaken, followUpDate } = screening;

  if (status !== 'reviewed') {
    return (
      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-2.5 text-xs text-amber-400 font-mono">
        <Clock className="w-4 h-4 animate-pulse" />
        <span>Awaiting medical verification and review...</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-3 text-xs font-sans text-left">
      <div className="flex justify-between items-center border-b border-emerald-500/20 pb-2">
        <span className="font-bold text-emerald-450 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-400" /> Diagnosis & Recommendations Review
        </span>
        <span className="text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-emerald-350 font-mono">
          Reviewed
        </span>
      </div>

      <div className="space-y-2 text-slate-300">
        <p>
          <span className="text-slate-500 font-bold block text-[9px] uppercase tracking-wider">Clinician:</span>
          {doctorName || 'Dr. Sarika Sharma'}
        </p>
        <p>
          <span className="text-slate-500 font-bold block text-[9px] uppercase tracking-wider">Directives:</span>
          <span className="capitalize font-bold text-cyan-400">
            {actionTaken?.replace('_', ' ') || 'Lifestyle modifications'}
          </span>
        </p>
        <p>
          <span className="text-slate-500 font-bold block text-[9px] uppercase tracking-wider">Clinical Notes:</span>
          <span className="italic">"{doctorNotes || 'No notes available.'}"</span>
        </p>
        {followUpDate && (
          <div className="pt-2 border-t border-emerald-500/15 text-[10px] text-amber-400 font-mono flex items-center gap-1.5">
            🔔 Follow-up scheduled on: {new Date(followUpDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};
export default FollowupCard;
