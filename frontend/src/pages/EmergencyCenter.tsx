import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertOctagon, Phone, Heart, Truck, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockEmergencyContacts, mockEmergencyTimeline } from '../services/mockData';
import hospitalService from '../services/hospitalService';
import { Hospital } from '../types';

export const EmergencyCenter: React.FC = () => {
  const { emergencyState, triggerSOS, resetSOS } = useApp();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await hospitalService.getHospitals();
        setHospitals(data.filter(h => h.emergencyAvailable));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const getAmbulanceStepIndex = () => {
    switch (emergencyState.ambulanceStatus) {
      case 'dispatched': return 1;
      case 'en_route': return 2;
      case 'arrived': return 3;
      default: return 0;
    }
  };

  const currentStep = getAmbulanceStepIndex();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#0b1120] to-[#0b1120] border border-red-500/20 shadow-glow-rose">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl animate-pulse">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-sans">Emergency Operations Command</h2>
            <p className="text-xs text-slate-400 mt-1">Real-time SOS response tracking, telemedicine telemetry, and EMS dispatch logs.</p>
          </div>
        </div>
        <div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            emergencyState.riskLevel === 'CRITICAL' 
              ? 'bg-red-500 text-black shadow-glow-rose' 
              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
          }`}>
            Risk Index: {emergencyState.riskLevel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: SOS Command Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {emergencyState.sosActive && (
              <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
            )}
            
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-6">SOS Primary Trigger</h3>
            
            {emergencyState.sosActive ? (
              <button
                onClick={resetSOS}
                className="w-44 h-44 rounded-full bg-slate-900 border-2 border-red-500 flex flex-col items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 active:scale-95 transition-all shadow-glow-rose"
              >
                <ShieldAlert className="w-10 h-10 animate-bounce" />
                <span className="text-xs font-black tracking-widest uppercase">CANCEL SOS</span>
              </button>
            ) : (
              <button
                onClick={triggerSOS}
                className="w-44 h-44 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex flex-col items-center justify-center gap-2 text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)]"
              >
                <AlertOctagon className="w-10 h-10 stroke-[2.5]" />
                <span className="text-sm font-black tracking-widest uppercase">TRIGGER SOS</span>
              </button>
            )}

            <p className="text-[10px] text-slate-500 mt-6 leading-relaxed">
              {emergencyState.sosActive 
                ? "Emergency dispatcher connected. Sharing core diagnostics."
                : "Tapping will dispatch ambulance and push vitals telemetry report to nearest trauma centers."}
            </p>
          </div>

          {/* Emergency Contacts */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">SOS Contacts</h3>
            <div className="space-y-3">
              {mockEmergencyContacts.map((contact, i) => (
                <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-200">{contact.name}</p>
                    <p className="text-[10px] text-slate-500">{contact.relation}</p>
                  </div>
                  <a href={`tel:${contact.phone}`} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Ambulance Tracking */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Ambulance Tracker</h3>
            
            {emergencyState.sosActive ? (
              <div className="space-y-6">
                <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-red-400 animate-bounce" />
                    <div>
                      <p className="text-xs font-bold text-slate-200 uppercase">Standby Vehicle 104</p>
                      <p className="text-[10px] text-slate-400 capitalize mt-0.5">Status: {emergencyState.ambulanceStatus?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-red-400 leading-none">{emergencyState.ambulanceEtaMinutes} min</p>
                    <p className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">ETA to destination</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Dispatch</span>
                    <span>En Route</span>
                    <span>Arrived</span>
                  </div>
                  <div className="h-1.5 bg-slate-800/40 rounded-full relative overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full transition-all duration-1000"
                      style={{ width: `${currentStep === 1 ? 33 : currentStep === 2 ? 66 : currentStep === 3 ? 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Distance remaining</span>
                    <span className="font-semibold text-slate-200">{emergencyState.ambulanceDistanceKm} km</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Telemetry Feed</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-emerald-400/20 animate-pulse" /> Active
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Truck className="w-10 h-10 mb-2 stroke-[1.5]" />
                <p className="text-xs font-medium">No active dispatches.</p>
                <p className="text-[10px] text-slate-600 mt-1">Simulate by tapping the SOS Trigger button.</p>
              </div>
            )}
          </div>

          {/* Timeline logs */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Emergency Event Log</h3>
            <div className="space-y-4 relative pl-3 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-850">
              {mockEmergencyTimeline.map((item) => (
                <div key={item.id} className="relative space-y-1">
                  <div className={`absolute -left-4.5 w-3 h-3 rounded-full border-2 border-[#0b1120] ${item.alert ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`} />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                    <h4 className={`text-xs font-bold ${item.alert ? 'text-red-400' : 'text-slate-300'}`}>{item.title}</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Trauma centers */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Nearby Trauma Centers</h3>
            {loading ? (
              <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin text-cyan-400" /></div>
            ) : hospitals.length > 0 ? (
              <div className="space-y-3.5">
                {hospitals.map((hosp) => (
                  <div key={hosp.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{hosp.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{hosp.location}</p>
                      </div>
                      <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        ER Open
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] border-t border-white/5 pt-2">
                      <span className="text-slate-500">Beds available</span>
                      <span className="font-semibold text-slate-300">{hosp.bedsAvailable} available</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No emergency hospitals registered.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EmergencyCenter;
