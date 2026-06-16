import React from 'react';
import { AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';

export const Spinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <RotateCw className="w-8 h-8 text-cyan-400 animate-spin" />
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="glass-card p-6 rounded-2xl animate-pulse space-y-4">
    <div className="flex justify-between items-center">
      <div className="h-4 w-1/3 bg-slate-850 rounded"></div>
      <div className="w-8 h-8 rounded-lg bg-slate-850"></div>
    </div>
    <div className="h-8 w-1/2 bg-slate-850 rounded"></div>
    <div className="h-3 w-2/3 bg-slate-850 rounded"></div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="glass-card p-6 rounded-2xl animate-pulse space-y-4">
    <div className="h-6 w-1/4 bg-slate-850 rounded mb-6"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex justify-between items-center py-3 border-b border-slate-800/40">
        <div className="h-4 w-1/4 bg-slate-850 rounded"></div>
        <div className="h-4 w-1/3 bg-slate-850 rounded"></div>
        <div className="h-4 w-12 bg-slate-850 rounded"></div>
      </div>
    ))}
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="glass-card p-6 rounded-2xl animate-pulse space-y-6">
    <div className="h-5 w-1/3 bg-slate-850 rounded"></div>
    <div className="h-48 w-full bg-slate-850/20 rounded flex items-end gap-2 p-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-850 rounded-t w-full"
          style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }}
        ></div>
      ))}
    </div>
  </div>
);

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = "Failed to load clinic records.",
  onRetry
}) => (
  <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 border border-rose-500/25">
    <AlertCircle className="w-12 h-12 text-rose-400 animate-pulse" />
    <div>
      <h3 className="font-semibold text-slate-200">System Error</h3>
      <p className="text-sm text-slate-400 mt-1">{message}</p>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="glass-btn-secondary py-2 px-4 text-sm">
        Retry Request
      </button>
    )}
  </div>
);

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data found",
  description = "There are no records to display here.",
  icon,
  actionLabel,
  onAction
}) => (
  <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
    {icon || <AlertCircle className="w-12 h-12 text-slate-500" />}
    <div>
      <h3 className="font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 mt-1">{description}</p>
    </div>
    {actionLabel && onAction && (
      <button onClick={onAction} className="glass-btn-primary py-2 px-4 text-sm text-black">
        {actionLabel}
      </button>
    )}
  </div>
);

export const SuccessState: React.FC<{ title?: string; message: string; onClose?: () => void }> = ({
  title = "Action Successful",
  message,
  onClose
}) => (
  <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 border border-emerald-500/25">
    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
    <div>
      <h3 className="font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 mt-1">{message}</p>
    </div>
    {onClose && (
      <button onClick={onClose} className="glass-btn-primary py-2 px-4 text-sm text-black">
        Dismiss
      </button>
    )}
  </div>
);
