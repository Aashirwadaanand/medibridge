import React, { useState, useEffect } from 'react';
import { Building, Clock, Plus, Trash2, CalendarRange, Check, X, AlertCircle, CalendarDays, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import appointmentService from '../services/appointmentService';
import { Appointment } from '../types';
import { useApp } from '../context/AppContext';
import { TableSkeleton, SuccessState } from '../components/common/Loader';

export const AppointmentsPage: React.FC = () => {
  const { currentUser, addNotification } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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
  
  // Doctor completion note states
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [consultNotes, setConsultNotes] = useState('');

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      if (currentUser.role === 'doctor') {
        // Filter appointments assigned to this doctor
        setAppointments(data.filter(a => a.doctorId === currentUser.id));
      } else {
        // Filter appointments requested by this patient
        setAppointments(data.filter(a => a.patientId === currentUser.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentUser]);

  // Refreshes the scheduling lists in real time during demo role changes
  useEffect(() => {
    const handleDemoRefresh = () => {
      fetchAppointments();
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

  // Filter list
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
        <h2 className="text-xl font-bold text-slate-100 font-sans">
          {currentUser.role === 'doctor' ? 'Patient Consultation Queue' : 'Clinical Consultations'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {currentUser.role === 'doctor' 
            ? 'Review and manage your scheduled clinical patient visits, requests, and record consult notes.' 
            : 'Book diagnostic meetings or review historical clinical consult logs.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Option based on Role */}
        {currentUser.role === 'doctor' ? (
          <div className="lg:col-span-1 glass-card p-6 rounded-2xl border border-white/5 space-y-4 h-fit font-sans text-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-2">Consultation Statistics</h3>
            <div className="space-y-3.5 text-slate-400 leading-normal">
              <p>You are viewing your active patient consultation queue.</p>
              <p>Clinicians can approve patient meeting requests, write clinical prescription summaries, or clear scheduled checks from this hub.</p>
              
              <div className="p-3.5 bg-cyan-500/5 border border-cyan-500/10 rounded-xl text-cyan-400 font-bold font-mono">
                Assigned Consultations: {appointments.length}
              </div>
            </div>
          </div>
        ) : (
          /* Book Form for Patients */
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
        )}

        {/* Schedule List */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2 gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
              {currentUser.role === 'doctor' ? 'Clinical Consultations List' : 'Consultation Schedule'}
            </h3>
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
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-200">
                            {currentUser.role === 'doctor' ? `Patient: ${appt.patientName}` : `Doctor: ${appt.doctorName}`}
                          </h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            appt.status === 'approved' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : appt.status === 'pending' 
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse' 
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
                          {currentUser.role === 'doctor' ? (
                            <>
                              {appt.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(appt.id)}
                                  disabled={updatingId === appt.id}
                                  className="px-3 py-1 bg-cyan-500 text-black text-[10px] font-bold rounded hover:bg-cyan-400"
                                >
                                  Approve Request
                                </button>
                              )}
                              {appt.status === 'approved' && (
                                <>
                                  {completingId === appt.id ? (
                                    <div className="flex flex-col gap-2 mt-2 w-full text-xs font-sans text-left">
                                      <textarea
                                        placeholder="Add clinical consult notes..."
                                        value={consultNotes}
                                        onChange={(e) => setConsultNotes(e.target.value)}
                                        className="bg-[#0b1120] border border-white/5 rounded p-2 text-xs text-slate-200 w-64 focus:outline-none"
                                        rows={2}
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleComplete(appt.id)}
                                          className="px-2.5 py-1 bg-emerald-500 text-black text-[9px] font-bold rounded flex items-center gap-1"
                                        >
                                          <Check className="w-3 h-3" /> Save &amp; Complete
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setCompletingId(null)}
                                          className="text-[9px] text-slate-500 uppercase hover:underline"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCompletingId(appt.id);
                                        setConsultNotes(appt.notes || '');
                                      }}
                                      className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-bold rounded hover:bg-emerald-450 flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Complete Consult
                                    </button>
                                  )}
                                </>
                              )}
                            </>
                          ) : (
                            /* Patient Actions */
                            reschedulingId !== appt.id ? (
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
                            ) : null
                          )}
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
    </div>
  );
};

export default AppointmentsPage;
