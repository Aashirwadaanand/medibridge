import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Activity, Stethoscope, Building, Shield, 
  AlertTriangle, FileText, ChevronDown, Bell,
  Calendar, Truck, LineChart
} from 'lucide-react';
import { useAppMode } from '../../context/AppModeContext';
import { useApp } from '../../context/AppContext';
import { mockUsers, syncInMemoryCache } from '../../services/mockData';

export const PresentationToolkit: React.FC = () => {
  const { mode } = useAppMode();
  const { emergencyState, triggerSOS, resetSOS, addNotification } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isAmbulanceSimulating, setIsAmbulanceSimulating] = useState(false);

  if (mode !== 'demo') return null;

  const handleRoleSwitch = (roleName: 'patient' | 'doctor' | 'hospital' | 'admin') => {
    const targetUser = mockUsers[roleName];
    if (targetUser) {
      localStorage.setItem('medibridge_user', JSON.stringify(targetUser));
      localStorage.setItem('medibridge_role', roleName);
      localStorage.setItem('medibridge_token', targetUser.token || `mock-jwt-token-${roleName}`);
      
      addNotification(
        `${roleName.toUpperCase()} SCENARIO ACTIVATED`,
        `Successfully logged in as ${targetUser.name}. Initializing workspace telemetry.`,
        'general'
      );
      
      // Update local state if needed, or force reload to trigger complete dashboard transition
      window.location.href = `/${roleName}`;
    }
  };

  const handleGenerateNotifications = () => {
    const templates = [
      { title: 'Critical Telemetry Flagged', message: 'Resting heart rate exceeded 115 bpm during rest. Recommended check.', type: 'emergency' },
      { title: 'Prescription Refill Ready', message: 'Apollo Pharmacy has processed and packaged your Atorvastatin refill.', type: 'medicine' },
      { title: 'Cardiology Sync Completed', message: '12-lead ECG telemetry logs correctly synced with clinical control.', type: 'general' },
      { title: 'New Lab Insights Available', message: 'Weekly endocrine thyroid profile analysis report completed.', type: 'general' },
      { title: 'Consultation Approved', message: 'Dr. Sarika Sharma approved meeting request for cardiovascular evaluation.', type: 'appointment' }
    ];

    // Pick 3 random templates and trigger
    const shuffled = [...templates].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    selected.forEach(t => {
      addNotification(t.title, t.message, t.type as any);
    });

    window.dispatchEvent(new Event('medibridge-demo-refresh'));
    setSuccessToast('Generated 3 live notification updates!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleTriggerEmergency = () => {
    if (emergencyState.sosActive) {
      resetSOS();
      setSuccessToast('Emergency SOS cancelled. Telemetry set to normal.');
    } else {
      triggerSOS();
      setSuccessToast('Emergency SOS Triggered! Ambulance dispatched.');
    }
    window.dispatchEvent(new Event('medibridge-demo-refresh'));
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handlePopulateAppointments = () => {
    const freshAppts = [
      {
        id: `appt_demo_${Date.now()}_1`,
        patientId: 'user_pat_01',
        patientName: 'Anshuman Das',
        doctorId: 'user_doc_01',
        doctorName: 'Dr. Sarika Sharma',
        hospitalId: 'user_hosp_01',
        hospitalName: 'Apollo Hospital Delhi',
        dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending' as const,
        reason: 'Hypertension Telemetry Review'
      },
      {
        id: `appt_demo_${Date.now()}_2`,
        patientId: 'pat_2',
        patientName: 'Neha Das',
        doctorId: 'user_doc_01',
        doctorName: 'Dr. Sarika Sharma',
        hospitalId: 'user_hosp_01',
        hospitalName: 'Apollo Hospital Delhi',
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved' as const,
        reason: 'Cardiac Palpitations Evaluation'
      },
      {
        id: `appt_demo_${Date.now()}_3`,
        patientId: 'user_pat_01',
        patientName: 'Anshuman Das',
        doctorId: 'user_doc_01',
        doctorName: 'Dr. Sarika Sharma',
        hospitalId: 'user_hosp_01',
        hospitalName: 'Apollo Hospital Delhi',
        dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed' as const,
        reason: 'Routine Annual Physical checkup'
      }
    ];

    const stored = JSON.parse(localStorage.getItem('medibridge_demo_appointments') || '[]');
    const updated = [...freshAppts, ...stored];
    localStorage.setItem('medibridge_demo_appointments', JSON.stringify(updated));
    syncInMemoryCache();

    addNotification(
      'Appointments Seeding Complete',
      'Successfully populated active appointments workspace queues.',
      'appointment'
    );

    window.dispatchEvent(new Event('medibridge-demo-refresh'));
    setSuccessToast('Populated appointments database!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSimulateAmbulance = () => {
    if (isAmbulanceSimulating) {
      setSuccessToast('Ambulance simulation already running.');
      setTimeout(() => setSuccessToast(null), 2000);
      return;
    }

    setIsAmbulanceSimulating(true);
    triggerSOS();

    addNotification(
      'AMBULANCE DISPATCHED',
      'Ambulance Vehicle #402 dispatched from Central EMS Depot. ETA: 8 minutes. Distance: 4.2 km.',
      'emergency'
    );
    window.dispatchEvent(new Event('medibridge-demo-refresh'));

    // Step 2: En Route (after 3.5 seconds)
    setTimeout(() => {
      addNotification(
        'AMBULANCE EN ROUTE',
        'Ambulance Vehicle #402 navigating ring traffic. ETA: 3 minutes. Distance: 1.8 km.',
        'emergency'
      );
      window.dispatchEvent(new Event('medibridge-demo-refresh'));
    }, 3500);

    // Step 3: Arrived (after 7 seconds)
    setTimeout(() => {
      addNotification(
        'AMBULANCE ARRIVED',
        'Ambulance Vehicle #402 arrived at patient residence. Patient stabilized, en route to ER.',
        'emergency'
      );
      window.dispatchEvent(new Event('medibridge-demo-refresh'));
      setIsAmbulanceSimulating(false);
      setSuccessToast('Ambulance arrival simulated successfully!');
      setTimeout(() => setSuccessToast(null), 3000);
    }, 7000);

    setSuccessToast('Initiated Ambulance simulation route...');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handlePopulateReports = () => {
    const newReports = [
      {
        id: `rep_demo_${Date.now()}_1`,
        patientId: 'user_pat_01',
        patientName: 'Anshuman Das',
        title: 'Comprehensive Metabolic Panel (CMP)',
        uploadDate: new Date().toISOString(),
        status: 'completed' as const,
        parsedInsights: {
          summary: 'Metabolic panel shows stable electrolyte levels. Kidney filtration rate (eGFR) is optimal at 92 mL/min/1.73m2. Liver enzymes are within normal limits.',
          criticalFindings: [
            'Glucose, Fasting: 98 mg/dL (Normal: 70 - 99)',
            'eGFR: 92 mL/min/1.73m2 (Normal: >60)'
          ],
          recommendations: [
            'Continue drinking adequate water.',
            'Review dietary carbohydrate intake at next follow-up.'
          ]
        }
      },
      {
        id: `rep_demo_${Date.now()}_2`,
        patientId: 'user_pat_01',
        patientName: 'Anshuman Das',
        title: 'Lipid Control Panel',
        uploadDate: new Date().toISOString(),
        status: 'completed' as const,
        parsedInsights: {
          summary: 'Lipid review highlights high total cholesterol and elevated LDL levels. Cardiovascular safety tracking recommended.',
          criticalFindings: [
            'Total Cholesterol: 245 mg/dL (High)',
            'LDL Cholesterol: 162 mg/dL (High)'
          ],
          recommendations: [
            'Adopt low-sodium, low-saturated fat diet immediately.',
            'Initiate moderate aerobic cardiovascular exercises 30 mins daily.'
          ]
        }
      }
    ];

    const stored = JSON.parse(localStorage.getItem('medibridge_demo_reports') || '[]');
    const updated = [...newReports, ...stored];
    localStorage.setItem('medibridge_demo_reports', JSON.stringify(updated));
    syncInMemoryCache();

    addNotification(
      'AI Laboratory Report Ingested',
      'Ingested Comprehensive Metabolic Panel and Lipid Panel reports with detailed parsed clinical summaries.',
      'general'
    );

    window.dispatchEvent(new Event('medibridge-demo-refresh'));
    setSuccessToast('Ingested clinical reports successfully!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleAnimateCharts = () => {
    let count = 0;
    const interval = setInterval(() => {
      const fluctuated = [
        { time: '08:00', bp: '122/81', heartRate: 72 + Math.floor(Math.random() * 10 - 5), temp: 98.6, oxygen: 99 },
        { time: '10:00', bp: '118/79', heartRate: 75 + Math.floor(Math.random() * 10 - 5), temp: 98.4, oxygen: 98 },
        { time: '12:00', bp: '124/82', heartRate: 81 + Math.floor(Math.random() * 10 - 5), temp: 98.7, oxygen: 99 },
        { time: '14:00', bp: '128/84', heartRate: 88 + Math.floor(Math.random() * 10 - 5), temp: 99.0, oxygen: 97 },
        { time: '16:00', bp: '120/80', heartRate: 74 + Math.floor(Math.random() * 10 - 5), temp: 98.5, oxygen: 99 },
        { time: '18:00', bp: '122/81', heartRate: 70 + Math.floor(Math.random() * 10 - 5), temp: 98.3, oxygen: 98 },
        { time: '20:00', bp: '118/78', heartRate: 68 + Math.floor(Math.random() * 10 - 5), temp: 98.1, oxygen: 99 }
      ];
      
      window.dispatchEvent(new CustomEvent('medibridge-vitals-update', { detail: fluctuated }));
      count++;
      if (count >= 12) {
        clearInterval(interval);
      }
    }, 600);

    setSuccessToast('Simulating live vitals telemetry fluctuations...');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-lg shadow-purple-500/20 border border-purple-400/20 flex items-center gap-2 max-w-sm"
          >
            <Sparkles className="w-4 h-4 fill-white/10 shrink-0 animate-pulse" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="mb-3 w-80 glass-panel border border-white/10 rounded-2xl p-4 shadow-2xl bg-[#0b1120]/95 backdrop-blur-xl flex flex-col space-y-4 font-sans text-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <span className="text-[11px] font-bold text-slate-200 tracking-wider uppercase">Presentation Mode</span>
              </div>
              <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Demo Active</span>
            </div>

            {/* Scenarios Section */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">One-Click Demonstration Scenarios</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleRoleSwitch('patient')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 transition-all font-semibold"
                >
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Patient Scenario</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('doctor')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 transition-all font-semibold"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-400" />
                  <span>Doctor Scenario</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('hospital')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-purple-500/30 text-slate-300 hover:text-purple-400 transition-all font-semibold"
                >
                  <Building className="w-4 h-4 text-purple-400" />
                  <span>Hospital Scenario</span>
                </button>
                <button
                  onClick={() => handleRoleSwitch('admin')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-amber-500/30 text-slate-300 hover:text-amber-400 transition-all font-semibold"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Admin Scenario</span>
                </button>
              </div>
            </div>

            {/* Simulations Section */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Interactive Simulators</span>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleGenerateNotifications}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-blue-500/20 text-slate-300 hover:text-blue-400 transition-all text-left"
                  >
                    <Bell className="w-3.5 h-3.5 text-blue-450 shrink-0" />
                    <span>Generate Notifications</span>
                  </button>

                  <button
                    onClick={handleTriggerEmergency}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-left ${
                      emergencyState.sosActive
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-450'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-rose-500/20 text-slate-300 hover:text-rose-400'
                    }`}
                  >
                    <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${emergencyState.sosActive ? 'animate-bounce text-rose-450' : 'text-rose-450'}`} />
                    <span>{emergencyState.sosActive ? 'Reset SOS State' : 'Trigger Emergency'}</span>
                  </button>

                  <button
                    onClick={handlePopulateAppointments}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-emerald-500/20 text-slate-300 hover:text-emerald-400 transition-all text-left"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-450 shrink-0" />
                    <span>Populate Appointments</span>
                  </button>

                  <button
                    onClick={handleSimulateAmbulance}
                    disabled={isAmbulanceSimulating}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-purple-500/20 text-slate-300 hover:text-purple-400 transition-all text-left disabled:opacity-50"
                  >
                    <Truck className="w-3.5 h-3.5 text-purple-450 shrink-0" />
                    <span>Simulate Ambulance</span>
                  </button>

                  <button
                    onClick={handlePopulateReports}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-cyan-500/20 text-slate-300 hover:text-cyan-400 transition-all text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-450 shrink-0" />
                    <span>Populate Reports</span>
                  </button>

                  <button
                    onClick={handleAnimateCharts}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-amber-500/20 text-slate-300 hover:text-amber-400 transition-all text-left"
                  >
                    <LineChart className="w-3.5 h-3.5 text-amber-450 shrink-0" />
                    <span>Animate Charts</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-3 bg-gradient-to-tr from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white hover:scale-105 active:scale-95 transition-all shadow-glow-purple border border-purple-400/20 rounded-full"
        title="Open Presentation Controls"
      >
        {isOpen ? <ChevronDown className="w-5 h-5 animate-pulse" /> : <Sparkles className="w-5 h-5 fill-white/10" />}
      </button>
    </div>
  );
};

export default PresentationToolkit;
