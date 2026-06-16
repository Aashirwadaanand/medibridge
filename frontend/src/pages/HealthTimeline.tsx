import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Pill, ShieldAlert, Award, Clock, Search, Stethoscope, ChevronRight 
} from 'lucide-react';
import reportService from '../services/reportService';
import prescriptionService from '../services/prescriptionService';
import appointmentService from '../services/appointmentService';
import { useApp } from '../context/AppContext';
import { TableSkeleton } from '../components/common/Loader';
import { MedicalReport, Prescription, Appointment } from '../types';

interface TimelineEvent {
  id: string;
  type: 'visit' | 'report' | 'prescription' | 'vaccination';
  title: string;
  subtitle: string;
  date: Date;
  meta: string;
  details?: string[];
  original: any;
}

export const HealthTimeline: React.FC = () => {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'visit' | 'report' | 'prescription' | 'vaccination'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Define static mock vaccination records for the patient
  const mockVaccinations: TimelineEvent[] = [
    {
      id: 'vac_01',
      type: 'vaccination',
      title: 'Hepatitis B Booster Dose',
      subtitle: 'Apollo Immunization Clinic',
      date: new Date('2026-04-10T09:00:00Z'),
      meta: 'Immunization Record',
      details: ['Batch: HB-99812A', 'Next booster due: 2031'],
      original: {}
    },
    {
      id: 'vac_02',
      type: 'vaccination',
      title: 'Covishield Covid-19 Dose 2',
      subtitle: 'Delhi Metro Transit Vaccination Hub',
      date: new Date('2025-08-15T11:30:00Z'),
      meta: 'Immunization Record',
      details: ['Batch: COV-38411', 'Status: Fully Vaccinated'],
      original: {}
    },
    {
      id: 'vac_03',
      type: 'vaccination',
      title: 'Covishield Covid-19 Dose 1',
      subtitle: 'Delhi Metro Transit Vaccination Hub',
      date: new Date('2025-05-10T10:15:00Z'),
      meta: 'Immunization Record',
      details: ['Batch: COV-12003'],
      original: {}
    },
    {
      id: 'vac_04',
      type: 'vaccination',
      title: 'Tetanus Toxoid Vaccine',
      subtitle: 'Medibridge Care Staging',
      date: new Date('2024-11-20T16:00:00Z'),
      meta: 'Immunization Record',
      details: ['Injury booster response', 'Validity: 10 years'],
      original: {}
    }
  ];

  useEffect(() => {
    const loadTimelineData = async () => {
      setLoading(true);
      try {
        // Fetch data parallelly
        const [reports, prescriptions, appointments] = await Promise.all([
          reportService.getReports(),
          prescriptionService.getPrescriptions(),
          appointmentService.getAppointments()
        ]);

        const patientReports = reports.filter(r => r.patientId === currentUser.id);
        const patientPrescriptions = prescriptions.filter(p => p.patientId === currentUser.id);
        const patientAppointments = appointments.filter(a => a.patientId === currentUser.id);

        const loadedEvents: TimelineEvent[] = [];

        // Add Reports to timeline
        patientReports.forEach((rep: MedicalReport) => {
          loadedEvents.push({
            id: rep.id,
            type: 'report',
            title: rep.title,
            subtitle: 'Diagnostic Lab Report Upload',
            date: new Date(rep.uploadDate),
            meta: `Status: ${rep.status.toUpperCase()}`,
            details: rep.parsedInsights?.criticalFindings || ['Processing automated clinical OCR...'],
            original: rep
          });
        });

        // Add Prescriptions to timeline
        patientPrescriptions.forEach((pres: Prescription) => {
          loadedEvents.push({
            id: pres.id,
            type: 'prescription',
            title: `Prescription from ${pres.doctorName}`,
            subtitle: 'Clinical Medication Order',
            date: new Date(pres.date),
            meta: `Status: ${pres.status.toUpperCase()}`,
            details: pres.medicines.map(m => `${m.medicineName} (${m.dosage}) - ${m.frequency}`),
            original: pres
          });
        });

        // Add Completed/Approved Visits to timeline
        patientAppointments.forEach((appt: Appointment) => {
          if (appt.status === 'completed' || appt.status === 'approved') {
            loadedEvents.push({
              id: appt.id,
              type: 'visit',
              title: `Consultation with ${appt.doctorName}`,
              subtitle: appt.hospitalName,
              date: new Date(appt.dateTime),
              meta: `Purpose: ${appt.reason}`,
              details: appt.notes ? [appt.notes] : undefined,
              original: appt
            });
          }
        });

        // Merge with static vaccinations
        const combined = [...loadedEvents, ...mockVaccinations];
        
        // Sort chronologically (newest first)
        combined.sort((a, b) => b.date.getTime() - a.date.getTime());
        setEvents(combined);
      } catch (err) {
        console.error('Error loading health timeline details', err);
      } finally {
        setLoading(false);
      }
    };

    loadTimelineData();
  }, [currentUser]);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.meta.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || event.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'visit':
        return <Stethoscope className="w-4 h-4 text-amber-400" />;
      case 'report':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'prescription':
        return <Pill className="w-4 h-4 text-sky-400" />;
      case 'vaccination':
        return <Award className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getEventBadgeClass = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'visit':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'report':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'prescription':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'vaccination':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-sans">Health Care Timeline</h2>
        <p className="text-xs text-slate-400 mt-1">Chronological log of clinical consults, diagnostics reports, medications, and immunization records.</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search timeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0b1120] border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
              filterType === 'all'
                ? 'bg-[#1e293b] text-emerald-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterType('visit')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
              filterType === 'visit'
                ? 'bg-[#1e293b] text-amber-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Consults
          </button>
          <button
            onClick={() => setFilterType('report')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
              filterType === 'report'
                ? 'bg-[#1e293b] text-purple-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setFilterType('prescription')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
              filterType === 'prescription'
                ? 'bg-[#1e293b] text-sky-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setFilterType('vaccination')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
              filterType === 'vaccination'
                ? 'bg-[#1e293b] text-emerald-400 border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vaccines
          </button>
        </div>
      </div>

      {/* Timeline Structure */}
      {loading ? (
        <div className="glass-card p-8 rounded-2xl border border-white/5">
          <TableSkeleton rows={4} />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="relative border-l border-white/5 ml-4 md:ml-6 space-y-6 py-4">
          <AnimatePresence>
            {filteredEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.5) }}
                className="relative pl-8 md:pl-10 group"
              >
                {/* Node Dot / Icon */}
                <div className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full flex items-center justify-center bg-[#070b13] border border-white/10 shadow-lg group-hover:border-emerald-500/40 transition-colors z-10`}>
                  {getEventIcon(event.type)}
                </div>

                {/* Timeline Card */}
                <div className="glass-card p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.03] pb-2 mb-3">
                    <div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getEventBadgeClass(event.type)}`}>
                        {event.type}
                      </span>
                      <h3 className="text-xs font-bold text-slate-200 mt-1">{event.title}</h3>
                      <p className="text-[10px] text-slate-400">{event.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 self-start sm:self-center font-sans">
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                      <span>{event.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{event.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Body details */}
                  {event.details && event.details.length > 0 && (
                    <div className="space-y-1">
                      {event.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-1.5 text-[11px] text-slate-400 font-medium leading-relaxed">
                          <ChevronRight className="w-3 h-3 text-slate-600 mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer Meta */}
                  <div className="mt-3 pt-2 border-t border-white/[0.02] flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{event.meta}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass-card p-12 text-center text-slate-500 rounded-2xl border border-white/5">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p className="text-xs font-medium">No matching health events found.</p>
        </div>
      )}
    </div>
  );
};

export default HealthTimeline;
