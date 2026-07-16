import React from 'react';
import { Screening } from '../../types';
import { RiskBadge } from './RiskBadge';

interface ScreeningSummaryCardProps {
  screening: Screening;
}

export const ScreeningSummaryCard: React.FC<ScreeningSummaryCardProps> = ({ screening }) => {
  const { readings, screeningType, riskClassifications } = screening;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
      {screeningType === 'Hypertension/Diabetes' ? (
        <>
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Blood Pressure</span>
            <span className="text-xl font-bold block mt-1.5 text-slate-200">
              {readings.systolic}/{readings.diastolic} <span className="text-xs text-slate-400 font-normal font-sans">mmHg</span>
            </span>
            <span className="text-[9px] text-slate-400 block mt-1">
              Hypertension: <span className="font-bold">{riskClassifications.hypertension || 'Normal'}</span>
            </span>
          </div>

          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Blood Glucose</span>
            <span className="text-xl font-bold block mt-1.5 text-slate-200">
              {readings.bloodSugar} <span className="text-xs text-slate-400 font-normal font-sans">mg/dL</span>
            </span>
            <span className="text-[9px] text-slate-400 block mt-1">
              Diabetes: <span className="font-bold">{riskClassifications.diabetes || 'Normal'} ({readings.bloodSugarType})</span>
            </span>
          </div>

          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-center flex flex-col justify-center items-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Overall Assessment</span>
            <RiskBadge risk={riskClassifications.overall} />
          </div>
        </>
      ) : screeningType === 'Anemia' ? (
        <>
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Hemoglobin Level</span>
            <span className="text-xl font-bold block mt-1.5 text-slate-200">
              {readings.hemoglobin} <span className="text-xs text-slate-400 font-normal font-sans">g/dL</span>
            </span>
            <span className="text-[9px] text-slate-400 block mt-1">
              Severity: <span className="font-bold text-slate-350">{riskClassifications.anemia || 'Normal'}</span>
            </span>
          </div>

          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-left text-[11px] space-y-1.5 text-slate-350">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block border-b border-white/5 pb-1">Maternal/Child Profile</span>
            <p><span className="text-slate-500">Pregnancy Status:</span> {readings.isPregnant ? `Pregnant (Trimester ${readings.trimester})` : 'Not Pregnant'}</p>
            <p><span className="text-slate-500">Age Category:</span> <span className="capitalize">{readings.ageGroup || 'Adult'}</span></p>
            <p><span className="text-slate-500">Body Weight:</span> {readings.weight ? `${readings.weight} kg` : 'N/A'}</p>
            <p><span className="text-slate-500">IFA Tablets Started:</span> {readings.ifaStarted ? 'Yes' : 'No'}</p>
          </div>

          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-center flex flex-col justify-center items-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Overall Assessment</span>
            <RiskBadge risk={riskClassifications.overall} />
          </div>
        </>
      ) : (
        <>
          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-left col-span-2">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Symptom Burden Checked</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {readings.tbSymptoms && readings.tbSymptoms.length > 0 ? (
                readings.tbSymptoms.map((s, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-slate-500 italic">No symptoms reported</span>
              )}
            </div>
          </div>

          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl text-center flex flex-col justify-center items-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Overall Assessment</span>
            <RiskBadge risk={riskClassifications.overall} />
          </div>
        </>
      )}
    </div>
  );
};
export default ScreeningSummaryCard;
