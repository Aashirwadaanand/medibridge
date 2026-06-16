import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by MEDIBRIDGE ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05070c] text-slate-200 flex flex-col items-center justify-center p-6 font-sans">
          <div className="w-full max-w-md p-8 rounded-2xl glass-panel border border-rose-500/25 bg-rose-500/[0.01] text-center space-y-6 shadow-2xl">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-450 animate-pulse">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">Application Crash Detected</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected runtime exception interrupted the MEDIBRIDGE clinical workspace telemetry.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-[10px] text-left font-mono text-rose-400/90 break-all max-h-32 overflow-y-auto">
                {this.state.error.name}: {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full glass-btn-primary py-2.5 text-xs text-black font-semibold flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Reset Application Session
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full glass-btn-secondary py-2.5 text-xs font-semibold text-slate-350"
              >
                Force Page Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
