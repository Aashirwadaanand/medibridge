import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  accentColor?: 'cyan' | 'emerald' | 'rose' | 'slate';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  change,
  trend,
  icon,
  accentColor = 'cyan'
}) => {
  const getGlowStyle = () => {
    switch (accentColor) {
      case 'cyan':
        return 'hover:border-cyan-500/30 hover:shadow-[0_12px_40px_-12px_rgba(6,182,212,0.15)]';
      case 'emerald':
        return 'hover:border-emerald-500/30 hover:shadow-[0_12px_40px_-12px_rgba(16,185,129,0.15)]';
      case 'rose':
        return 'hover:border-rose-500/30 hover:shadow-[0_12px_40px_-12px_rgba(244,63,94,0.15)]';
      default:
        return 'hover:border-slate-500/30 hover:shadow-2xl';
    }
  };

  const getIconBg = () => {
    switch (accentColor) {
      case 'cyan':
        return 'bg-cyan-500/10 text-cyan-400';
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400';
      case 'rose':
        return 'bg-rose-500/10 text-rose-400';
      default:
        return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className={`glass-card p-6 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${getGlowStyle()}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">{title}</span>
          <h3 className="text-2xl font-semibold text-slate-100 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${getIconBg()}`}>
          {icon}
        </div>
      </div>
      {(change !== undefined || subtext) && (
        <div className="flex items-center gap-2 mt-4 text-xs font-sans">
          {change !== undefined && (
            <span className={`flex items-center gap-0.5 font-semibold ${
              trend === 'up' 
                ? 'text-emerald-400' 
                : trend === 'down' 
                ? 'text-rose-400' 
                : 'text-slate-400'
            }`}>
              {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
              {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
              {change > 0 ? `+${change}%` : `${change}%`}
            </span>
          )}
          <span className="text-slate-500 truncate">{subtext}</span>
        </div>
      )}
    </div>
  );
};
export default MetricCard;
