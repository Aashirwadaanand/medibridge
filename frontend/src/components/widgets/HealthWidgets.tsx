import React, { useState, useEffect } from 'react';
import { Droplet, Plus, Square, CheckSquare, Footprints, CheckCircle2 } from 'lucide-react';

export const HydrationTracker: React.FC = () => {
  const [glasses, setGlasses] = useState(() => {
    return parseInt(localStorage.getItem('medibridge_demo_glasses') || '3');
  });
  const target = 8;
  const percentage = Math.min((glasses / target) * 100, 100);

  useEffect(() => {
    const handleRefresh = () => {
      setGlasses(parseInt(localStorage.getItem('medibridge_demo_glasses') || '3'));
    };
    window.addEventListener('medibridge-demo-refresh', handleRefresh);
    return () => window.removeEventListener('medibridge-demo-refresh', handleRefresh);
  }, []);

  const addGlass = () => {
    const newVal = glasses + 1;
    setGlasses(newVal);
    localStorage.setItem('medibridge_demo_glasses', newVal.toString());
    window.dispatchEvent(new Event('medibridge-demo-refresh'));
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 relative overflow-hidden">
      <div 
        className="absolute bottom-0 left-0 right-0 bg-cyan-500/5 transition-all duration-500" 
        style={{ height: `${percentage}%` }}
      />

      <div className="flex justify-between items-center relative z-10">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Hydration Index</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Daily target: {target} glasses</p>
        </div>
        <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
          <Droplet className="w-4 h-4 fill-cyan-400/20" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 relative z-10">
        <span className="text-3xl font-extrabold text-white tracking-tight">{glasses}</span>
        <span className="text-slate-400 text-sm">/ {target} glasses</span>
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <div className="flex-1 h-1.5 bg-slate-800/40 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <button 
          onClick={addGlass}
          className="p-1.5 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};

export const StepTracker: React.FC = () => {
  const [steps, setSteps] = useState(() => {
    return parseInt(localStorage.getItem('medibridge_demo_steps') || '6420');
  });
  const target = 10000;
  const percentage = Math.min((steps / target) * 100, 100);

  useEffect(() => {
    const handleRefresh = () => {
      setSteps(parseInt(localStorage.getItem('medibridge_demo_steps') || '6420'));
    };
    window.addEventListener('medibridge-demo-refresh', handleRefresh);
    return () => window.removeEventListener('medibridge-demo-refresh', handleRefresh);
  }, []);

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Step Tracker</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Daily target: {target}</p>
        </div>
        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
          <Footprints className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-white tracking-tight">{steps.toLocaleString()}</span>
        <span className="text-slate-400 text-sm">steps</span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
          <span>{percentage.toFixed(0)}% reached</span>
          <span>{Math.max(0, target - steps).toLocaleString()} left</span>
        </div>
        <div className="h-1.5 bg-slate-800/40 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export const MedicationTickOff: React.FC = () => {
  const [meds, setMeds] = useState([
    { id: 1, name: 'Lisinopril 10mg', time: '08:00 AM', taken: true },
    { id: 2, name: 'Atorvastatin 20mg', time: '09:30 PM', taken: false },
    { id: 3, name: 'Multivitamin', time: '12:00 PM', taken: false }
  ]);

  const toggleMed = (id: number) => {
    setMeds(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  const totalMeds = meds.length;
  const takenMeds = meds.filter(m => m.taken).length;
  const percentage = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 0;
  const allTaken = totalMeds > 0 && takenMeds === totalMeds;

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Daily Medications</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Toggle daily intake checklist</p>
        </div>
        <div className="text-[11px] font-bold text-slate-400 font-mono">
          {takenMeds}/{totalMeds} Taken
        </div>
      </div>

      {/* Progress Compliance Bar */}
      <div className="space-y-1">
        <div className="h-1.5 bg-slate-800/40 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-[9px] text-slate-500 font-semibold">{percentage}% daily compliance</div>
      </div>

      {/* Success State Banner */}
      {allTaken && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 text-emerald-400" />
          <span>All doses completed for today! Great job.</span>
        </div>
      )}

      <div className="space-y-2.5">
        {meds.map(med => (
          <button
            key={med.id}
            onClick={() => toggleMed(med.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
              med.taken 
                ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-400' 
                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {med.taken ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <p className={`text-xs font-medium ${med.taken ? 'line-through' : ''}`}>{med.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{med.time}</p>
              </div>
            </div>
            {med.taken && (
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Taken
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
