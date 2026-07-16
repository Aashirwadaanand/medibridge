import React from 'react';

interface RiskBadgeProps {
  risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk }) => {
  const normalizedRisk = risk?.toUpperCase();
  let classes = 'bg-slate-550/10 text-slate-400 border border-slate-500/20';

  if (normalizedRisk === 'CRITICAL') {
    classes = 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse';
  } else if (normalizedRisk === 'HIGH') {
    classes = 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
  } else if (normalizedRisk === 'MODERATE') {
    classes = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  } else if (normalizedRisk === 'LOW') {
    classes = 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20';
  }

  return (
    <span className={`text-[8px] sm:text-[9px] px-2.5 py-0.5 rounded font-black tracking-wider uppercase font-mono ${classes}`}>
      {risk} RISK
    </span>
  );
};
export default RiskBadge;
