import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building, Clock, Plus, Trash2, CalendarRange, Check, X, AlertCircle, 
  CalendarDays, FileText, User, Search, TrendingUp, Calendar, Clock3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import appointmentService from '../services/appointmentService';
import reportService from '../services/reportService';
import screeningService from '../services/screeningService';
import { Appointment, MedicalReport, Screening } from '../types';
import { useApp } from '../context/AppContext';
import { TableSkeleton, SuccessState } from '../components/common/Loader';

export const AppointmentsPage: React.FC = () => {
  const { currentUser, addNotification } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [doctorName, setDoctorName] = useState('Dr. Sarika Sharma');
  const [reason, setReason] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');

  // Additional states for enhancement
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [tempDateTime, setTempDateTime] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Doctor Completion Note States
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [consultNotes, setConsultNotes] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // Doctor-Patient Search directory states
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const fetchAppointmentsAndRecords = async () => {
    try {
      const [apptData, reportsData, screeningsData] = await Promise.all([
        appointmentService.getAppointments(),
        reportService.getReports(),
        screeningService.getScreenings()
      ]);
      
      setReports(reportsData);
      setScreenings(screeningsData);

      if (currentUser.role === 'doctor') {
        // Filter appointments assigned to this doctor
        const docAppts = apptData.filter(a => a.doctorId === currentUser.id);
        setAppointments(docAppts);
        
        // Auto-select first patient if directory is empty
        if (docAppts.length > 0 && !selectedPatientId) {
          setSelectedPatientId(docAppts[0].patientId);
        }
      } else {
        // Filter appointments requested by this patient
        setAppointments(apptData.filter(a => a.patientId === currentUser.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsAndRecords();
  }, [currentUser]);

  // Refreshes the scheduling lists in real time during demo role changes
  useEffect(() => {
    const handleDemoRefresh = () => {
      fetchAppointmentsAndRecords();
    };
    window.addEventListener('medibridge-demo-refresh', handleDemoRefresh);
    return () => window.removeEventListener('medibridge-demo-refresh', handleDemoRefresh);
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBooking(true);
    try {
      const newAppt = await appointmentService.createAppointment({
        patientId: currentUser.id,
        patientName: currentUser.name,
        doctorId: doctorName === 'Dr. Sarika Sharma' ? 'user_doc_01' : 'user_doc_02',
        doctorName,
        hospitalId: 'hosp_01',
        hospitalName: 'Apollo Hospital Delhi',
        dateTime,
        reason,
        notes
      });
      setAppointments(prev => [newAppt, ...prev]);
      setSuccessMsg(`Requested appointment with ${doctorName}. Status: Pending Verification.`);
      addNotification(
        'Appointment Requested',
        `A meeting request has been submitted to ${doctorName} for review.`,
        'appointment'
      );
      setReason('');
      setDateTime('');
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id: string) => {
    setUpdatingId(id);
    try {
      const updated = await appointmentService.updateAppointmentStatus(id, 'cancelled');
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      setSuccessMsg('Consultation has been cancelled.');
      addNotification(
        'Appointment Cancelled',
        `Your consultation request has been successfully cancelled.`,
        'appointment'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReschedule = async (id: string) => {
    if (!tempDateTime) return;
    setUpdatingId(id);
    try {
      const updated = await appointmentService.rescheduleAppointment(id, tempDateTime);
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      setSuccessMsg(`Rescheduled successfully. Status is reset to Pending.`);
      addNotification(
        'Appointment Rescheduled',
        `Your consultation has been rescheduled to ${new Date(tempDateTime).toLocaleString()}.`,
        'appointment'
      );
      setReschedulingId(null);
      setTempDateTime('');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Doctor Action: Approve Consultation
  const handleApprove = async (id: string) => {
    setUpdatingId(id);
    try {
      const updated = await appointmentService.updateAppointmentStatus(id, 'approved');
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      setSuccessMsg('Consultation request approved.');
      addNotification(
        'Appointment Approved',
        `The patient has been notified of the approved consultation slot.`,
        'appointment'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Doctor Action: Save notes & complete consultation
  const handleComplete = async (id: string) => {
    setUpdatingId(id);
    try {
      const updated = await appointmentService.updateAppointmentStatus(id, 'completed');
      updated.notes = consultNotes;
      
      const raw = localStorage.getItem('demo_db_appointments');
      if (raw) {
        const list = JSON.parse(raw);
        const idx = list.findIndex((a: any) => a.id === id);
        if (idx !== -1) {
          list[idx].status = 'completed';
          list[idx].notes = consultNotes;
          localStorage.setItem('demo_db_appointments', JSON.stringify(list));
        }
      }

      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      setSuccessMsg('Consultation marked completed with clinical summary notes.');
      addNotification('Consultation Completed', `Consultation notes saved successfully.`, 'appointment');
      setCompletingId(null);
      setConsultNotes('');
      window.dispatchEvent(new Event('medibridge-demo-refresh'));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Extract unique patients assigned to this doctor
  const doctorPatients = useMemo(() => {
    if (currentUser.role !== 'doctor') return [];
    const patientMap = new Map<string, { id: string; name: string; email: string }>();
    
    appointments.forEach(a => {
      if (a.doctorId === currentUser.id) {
        patientMap.set(a.patientId, {
          id: a.patientId,
          name: a.patientName,
          email: `${a.patientName.toLowerCase().replace(/\s+/g, '')}@medibridge.com`
        });
      }
    });

    // Seeding default clinic patients in case list is blank
    if (patientMap.size === 0) {
      patientMap.set('user_pat_01', { id: 'user_pat_01', name: 'Anshuman Das', email: 'patient@medibridge.com' });
      patientMap.set('user_pat_06', { id: 'user_pat_06', name: 'Priya Patel (Pregnant)', email: 'priya@medibridge.com' });
    }

    return Array.from(patientMap.values());
  }, [appointments, currentUser]);

  // Filter patient directory by search query
  const filteredPatients = useMemo(() => {
    return doctorPatients.filter(p => 
      p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(patientSearchQuery.toLowerCase())
    );
  }, [doctorPatients, patientSearchQuery]);

  // Selected Patient computed clinical telemetry records
  const selectedPatientRecords = useMemo(() => {
    if (!selectedPatientId) return null;
    
    const patientObj = doctorPatients.find(p => p.id === selectedPatientId) || {
      id: selectedPatientId,
      name: 'Anshuman Das',
      email: 'patient@medibridge.com'
    };

    const patientAppts = appointments.filter(a => a.patientId === selectedPatientId);
    const patientReports = reports.filter(r => r.patientId === selectedPatientId);
    const patientScreenings = screenings.filter(s => s.patientId === selectedPatientId);
    
    // Compute last consult follow up
    const latestScreening = [...patientScreenings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const followUp = latestScreening?.followUpDate 
      ? { date: new Date(latestScreening.followUpDate).toLocaleDateString(), status: latestScreening.followUpStatus }
      : null;

    // Vitals trends status summary
    let trendText = 'Stable';
    let trendClass = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (latestScreening) {
      const risk = latestScreening.riskClassifications?.overall;
      if (risk === 'CRITICAL') {
        trendText = 'Critical Risk Alert';
        trendClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse';
      } else if (risk === 'HIGH') {
        trendText = 'Needs Clinical Review';
        trendClass = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      }
    }

    return {
      profile: patientObj,
      appointments: patientAppts,
      reports: patientReports,
      screenings: patientScreenings,
      followUp,
      trends: { text: trendText, className: trendClass, latest: latestScreening }
    };
  }, [selectedPatientId, doctorPatients, appointments, reports, screenings]);

  // Filter list for patient role
  const upcomingAppointments = appointments.filter(
    a => a.status !== 'completed' && a.status !== 'cancelled'
  );
  
  const historicalAppointments = appointments.filter(
    a => a.status === 'completed' || a.status === 'cancelled'
  );

  const displayedAppointments = activeTab === 'upcoming' ? upcomingAppointments : historicalAppointments;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {successMsg && (
        <SuccessState message={successMsg} onClose={() => setSuccessMsg(null)} />
      )}

      <div>
        <h2 className="text-xl font-bold text-slate-100 font-sans font-black">
          {currentUser.role === 'doctor' ? 'Clinician Patient Directory' : 'Clinical Consultations'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {currentUser.role === 'doctor' 
            ? 'Search and manage active patient files, review diagnostic reports, trace health improvements, and log consultation notes.' 
            : 'Book diagnostic meetings or review historical clinical consult logs.'}
        </p>
      </div>

      {currentUser.role === 'doctor' ? (
        /* ================= DOCTOR CLINICAL PATIENT DIRECTORY ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          
          {/* Left panel: Patient search index (4 Cols) */}
          <div className="lg:col-span-4 glass-card p-5 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">Patient Index</h3>
            
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search patient by name or ID..."
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
                className="w-full bg-[#0b1120] border border-white/5 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filteredPatients.map(pat => {
                const isSelected = selectedPatientId === pat.id;
                return (
                  <button
                    key={pat.id}
                    onClick={() => {
                      setSelectedPatientId(pat.id);
                      setExpandedReportId(null);
                      setCompletingId(null);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected 
                        ? 'bg-cyan-500/5 border-cyan-500/20 shadow-glow-cyan' 
                        : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block text-xs">{pat.name}</span>
                        <span className="text-[9px] text-slate-550 block font-mono mt-0.5">{pat.id}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredPatients.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-6">No matching patients found.</p>
              )}
            </div>
          </div>

          {/* Right panel: Selected Patient Clinical History details (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedPatientRecords ? (
              <div className="space-y-6">
                
                {/* Patient Header Banner */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center font-bold text-black text-sm select-none">
                      {selectedPatientRecords.profile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{selectedPatientRecords.profile.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">ID: {selectedPatientRecords.profile.id} • Email: {selectedPatientRecords.profile.email}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded border font-mono font-bold text-[9px] uppercase tracking-wider ${selectedPatientRecords.trends.className}`}>
                    {selectedPatientRecords.trends.text}
                  </span>
                </div>

                {/* Vitals Improvements & Latest Telemetry */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2.5">
                    <TrendingUp className="w-4 h-4 text-cyan-400" /> Vitals Telemetry & Improvement Trends
                  </h4>
                  {selectedPatientRecords.trends.latest ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                      <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Intake Screening</span>
                        <span className="font-bold text-slate-200 mt-1 block">{selectedPatientRecords.trends.latest.screeningType}</span>
                      </div>
                      <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Observed Readings</span>
                        <span className="font-mono text-slate-200 mt-1 block">
                          {selectedPatientRecords.trends.latest.screeningType === 'Hypertension/Diabetes' ? (
                            <>
                              BP: {selectedPatientRecords.trends.latest.readings.systolic}/{selectedPatientRecords.trends.latest.readings.diastolic} mmHg<br/>
                              Glucose: {selectedPatientRecords.trends.latest.readings.bloodSugar} mg/dL
                            </>
                          ) : (
                            <>Hb: {selectedPatientRecords.trends.latest.readings.hemoglobin} g/dL</>
                          )}
                        </span>
                      </div>
                      <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Calculated Triage</span>
                        <span className="font-bold text-emerald-450 mt-1 block uppercase">
                          {selectedPatientRecords.trends.latest.riskClassifications?.overall} RISK
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No diagnostic screenings logged yet.</p>
                  )}
                </div>

                {/* Uploaded Diagnostic Reports */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2.5">
                    <FileText className="w-4 h-4 text-cyan-400" /> Patient Laboratory Uploaded Reports ({selectedPatientRecords.reports.length})
                  </h4>
                  {selectedPatientRecords.reports.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPatientRecords.reports.map(rep => {
                        const isExpanded = expandedReportId === rep.id;
                        return (
                          <div key={rep.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-2 text-xs font-sans">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-200">{rep.title}</span>
                              <button
                                onClick={() => setExpandedReportId(isExpanded ? null : rep.id)}
                                className="text-[10px] text-cyan-400 font-bold hover:underline"
                              >
                                {isExpanded ? 'Hide Insights' : 'View AI Clinical Insights'}
                              </button>
                            </div>
                            <span className="text-[9px] text-slate-550 block font-mono">Date: {new Date(rep.uploadDate).toLocaleDateString()}</span>
                            
                            {isExpanded && (
                              <div className="pt-3 border-t border-white/[0.03] space-y-2 bg-[#0b1120] p-3 rounded-lg border border-white/5">
                                {rep.parsedInsights ? (
                                  <>
                                    <p className="text-slate-300 leading-relaxed"><strong className="text-slate-200">AI Clinical Summary:</strong> {rep.parsedInsights.summary}</p>
                                    {rep.parsedInsights.criticalFindings?.length > 0 && (
                                      <div className="mt-2">
                                        <span className="text-[9px] text-amber-400 font-mono block uppercase font-bold tracking-wider">Critical Focus Areas:</span>
                                        <ul className="list-disc list-inside space-y-1 text-amber-300 font-mono">
                                          {rep.parsedInsights.criticalFindings.map((cf, i) => <li key={i}>{cf}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-slate-555 italic">Parsed report telemetry processing.</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No laboratory files uploaded.</p>
                  )}
                </div>

                {/* Past Consultations & Notes Editor */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-355 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2.5">
                    <Calendar className="w-4 h-4 text-cyan-455" /> Past Consultation Sessions & Logs
                  </h4>
                  {selectedPatientRecords.appointments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPatientRecords.appointments.map(appt => (
                        <div key={appt.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-200 block">{appt.reason}</span>
                            <span className="text-[9px] text-slate-500 block font-mono">Date: {new Date(appt.dateTime).toLocaleString()}</span>
                            {appt.notes && (
                              <p className="text-[10px] text-slate-400 italic bg-slate-950/20 p-2 rounded-lg border border-white/5 mt-2">
                                "{appt.notes}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                              appt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {appt.status}
                            </span>

                            {appt.status === 'approved' && (
                              <>
                                {completingId === appt.id ? (
                                  <div className="flex flex-col gap-2 bg-[#0b1120] p-3 rounded-lg border border-white/5 mt-2 w-64 text-left">
                                    <textarea
                                      placeholder="Log clinical consult notes..."
                                      value={consultNotes}
                                      onChange={(e) => setConsultNotes(e.target.value)}
                                      className="bg-transparent border border-white/5 rounded p-2 text-xs text-slate-200 focus:outline-none"
                                      rows={2}
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleComplete(appt.id)}
                                        className="px-2.5 py-1 bg-emerald-500 text-black text-[9px] font-bold rounded flex items-center gap-1"
                                      >
                                        Save &amp; Complete
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setCompletingId(null)}
                                        className="text-[9px] text-slate-500 uppercase"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => { setCompletingId(appt.id); setConsultNotes(appt.notes || ''); }}
                                    className="px-2.5 py-1 bg-emerald-500 text-black font-bold rounded text-[10px] hover:bg-emerald-450"
                                  >
                                    Complete Session
                                  </button>
                                )}
                              </>
                            )}

                            {appt.status === 'pending' && (
                              <button
                                onClick={() => handleApprove(appt.id)}
                                className="px-2.5 py-1 bg-cyan-500 text-black font-bold rounded text-[10px] hover:bg-cyan-400"
                              >
                                Approve Request
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No consult sessions recorded.</p>
                  )}
                </div>

                {/* Follow-up details */}
                <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2.5">
                    <Clock3 className="w-4 h-4 text-emerald-450" /> Active Specialist Referrals & Scheduled Follow-ups
                  </h4>
                  {selectedPatientRecords.followUp ? (
                    <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs flex justify-between items-center font-sans">
                      <div>
                        <span className="text-[9px] text-slate-555 block uppercase font-bold">Follow-up Date</span>
                        <span className="font-bold text-slate-200 mt-1 block">{selectedPatientRecords.followUp.date}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-555 block uppercase font-bold">ASHA Verification status</span>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[9px] font-mono border font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          {selectedPatientRecords.followUp.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No active referrals or follow-ups pending.</p>
                  )}
                </div>

              </div>
            ) : (
              <div className="glass-card p-12 text-center text-slate-500 italic text-xs min-h-[300px] flex items-center justify-center border border-white/5 rounded-2xl">
                Select a patient from the index panel to load clinical files.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= ORIGINAL APPOINTMENTS PAGE FOR PATIENTS ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Request Consultation Form */}
          <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 space-y-4 h-fit">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-white/5 pb-2">Request Consultation</h3>
            <form onSubmit={handleBook} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Select Clinician</label>
                <select
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full glass-input bg-[#0b1120] text-xs py-2"
                >
                  <option value="Dr. Sarika Sharma">Dr. Sarika Sharma (Cardiologist)</option>
                  <option value="Dr. Rajiv Patel">Dr. Rajiv Patel (Dermatologist)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Consultation Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Vitals review / checkup"
                  className="w-full glass-input py-2 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full glass-input py-2 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Additional Clinical Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="List current symptoms..."
                  className="w-full glass-input py-2 text-xs resize-none"
                />
              </div>
              <button type="submit" disabled={booking} className="glass-btn-primary w-full text-xs py-2 mt-2 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 text-black" /> {booking ? 'Scheduling...' : 'Request Slot'}
              </button>
            </form>
          </div>

          {/* Schedule List */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2 gap-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans font-bold">Consultation Schedule</h3>
              <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                    activeTab === 'upcoming'
                      ? 'bg-[#1e293b] text-cyan-400 border border-white/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Upcoming ({upcomingAppointments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                    activeTab === 'history'
                      ? 'bg-[#1e293b] text-cyan-400 border border-white/10'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  History ({historicalAppointments.length})
                </button>
              </div>
            </div>

            {loading ? (
              <TableSkeleton rows={3} />
            ) : displayedAppointments.length > 0 ? (
              <div className="space-y-3.5">
                <AnimatePresence mode="popLayout">
                  {displayedAppointments.map((appt) => (
                    <motion.div
                      key={appt.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-3 transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-200">Doctor: {appt.doctorName}</h4>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                              appt.status === 'approved' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : appt.status === 'pending' 
                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                                : appt.status === 'cancelled'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-slate-800 text-slate-500 border border-white/5'
                            }`}>
                              {appt.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-medium">{appt.reason}</p>
                          {appt.notes && (
                            <p className="text-[10px] text-slate-500 italic bg-white/[0.01] px-2.5 py-1 rounded border border-white/[0.03] mt-1.5 max-w-md">
                              "{appt.notes}"
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 pt-1 font-sans">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-650" /> {new Date(appt.dateTime).toLocaleString()}</span>
                            <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-slate-650" /> {appt.hospitalName}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        {activeTab === 'upcoming' && appt.status !== 'cancelled' && (
                          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                            {reschedulingId !== appt.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReschedulingId(appt.id);
                                    setTempDateTime(appt.dateTime.substring(0, 16));
                                  }}
                                  disabled={updatingId === appt.id}
                                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-cyan-400 bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 px-2.5 py-1 rounded transition-all"
                                >
                                  <CalendarDays className="w-3 h-3" /> Reschedule
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCancel(appt.id)}
                                  disabled={updatingId === appt.id}
                                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-rose-455 bg-white/[0.02] hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 px-2.5 py-1 rounded transition-all"
                                >
                                  <Trash2 className="w-3 h-3" /> Cancel
                                </button>
                              </>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* Reschedule Drawer Input Inline for Patient */}
                      {reschedulingId === appt.id && (
                        <div className="mt-2 p-3 rounded-lg bg-slate-900/50 border border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <CalendarRange className="w-3.5 h-3.5 text-cyan-400" /> Select New Slot
                            </span>
                            <button
                              type="button"
                              onClick={() => setReschedulingId(null)}
                              className="text-slate-500 hover:text-slate-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <input
                              type="datetime-local"
                              value={tempDateTime}
                              onChange={(e) => setTempDateTime(e.target.value)}
                              className="w-full sm:flex-1 glass-input py-1.5 px-2.5 text-xs text-slate-200 bg-[#070b13] border-white/10"
                              required
                            />
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={() => handleReschedule(appt.id)}
                                disabled={updatingId === appt.id || !tempDateTime}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-[10px] font-bold bg-cyan-500 hover:bg-cyan-600 text-black px-3 py-1.5 rounded transition-all"
                              >
                                <Check className="w-3 h-3" /> {updatingId === appt.id ? 'Saving...' : 'Confirm'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setReschedulingId(null)}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-[10px] font-bold text-slate-300 hover:text-slate-100 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded border border-white/5 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-16">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-semibold">No {activeTab} consultations found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
