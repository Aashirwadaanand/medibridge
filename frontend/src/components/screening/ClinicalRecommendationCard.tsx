import React from 'react';
import { Screening } from '../../types';
import { AnemiaRules } from '../../clinicalRules/anemiaRules';
import { HypertensionRules } from '../../clinicalRules/hypertensionRules';

interface ClinicalRecommendationCardProps {
  screening: Screening;
}

export const ClinicalRecommendationCard: React.FC<ClinicalRecommendationCardProps> = ({ screening }) => {
  const { readings, screeningType } = screening;

  let recommendations: string[] = [];
  if (screeningType === 'Anemia') {
    const rules = AnemiaRules.calculate({
      hemoglobin: readings.hemoglobin,
      isPregnant: readings.isPregnant,
      ageGroup: readings.ageGroup
    });
    recommendations = rules.recommendations || [];
  } else if (screeningType === 'Hypertension/Diabetes') {
    const rules = HypertensionRules.calculate({
      systolic: readings.systolic,
      diastolic: readings.diastolic,
      bloodSugar: readings.bloodSugar,
      bloodSugarType: readings.bloodSugarType as any
    });
    recommendations = rules.recommendations || [];
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2 font-sans text-left">
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block border-b border-white/5 pb-1.5">
        Guideline Reference Recommendations
      </span>
      <ul className="space-y-1.5 text-[11px] text-slate-350 list-disc list-inside">
        {recommendations.map((rec, i) => (
          <li key={i} className="leading-relaxed">
            {rec}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default ClinicalRecommendationCard;
