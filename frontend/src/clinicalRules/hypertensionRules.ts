export class HypertensionRules {
  public static calculate(readings: { systolic?: number; diastolic?: number; bloodSugar?: number; bloodSugarType?: 'fasting' | 'random' }) {
    const systolic = readings.systolic;
    const diastolic = readings.diastolic;
    const bloodSugar = readings.bloodSugar;
    const bloodSugarType = readings.bloodSugarType;

    let hypertension: 'Normal' | 'Prehypertension' | 'Stage 1' | 'Stage 2' | 'Crisis' = 'Normal';
    let diabetes: 'Normal' | 'Prediabetes' | 'Diabetes' = 'Normal';
    let overall: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let recommendations: string[] = [];

    // 1. Hypertension classification
    if (systolic !== undefined && diastolic !== undefined) {
      if (systolic >= 180 || diastolic >= 110) {
        hypertension = 'Crisis';
      } else if ((systolic >= 160 && systolic <= 179) || (diastolic >= 100 && diastolic <= 109)) {
        hypertension = 'Stage 2';
      } else if ((systolic >= 140 && systolic <= 159) || (diastolic >= 90 && diastolic <= 99)) {
        hypertension = 'Stage 1';
      } else if ((systolic >= 120 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
        hypertension = 'Prehypertension';
      } else {
        hypertension = 'Normal';
      }
    }

    // 2. Diabetes classification
    if (bloodSugar !== undefined && bloodSugarType) {
      if (bloodSugarType === 'fasting') {
        if (bloodSugar >= 126) {
          diabetes = 'Diabetes';
        } else if (bloodSugar >= 100 && bloodSugar <= 125) {
          diabetes = 'Prediabetes';
        } else {
          diabetes = 'Normal';
        }
      } else {
        // random
        if (bloodSugar >= 200) {
          diabetes = 'Diabetes';
        } else if (bloodSugar >= 140 && bloodSugar <= 199) {
          diabetes = 'Prediabetes';
        } else {
          diabetes = 'Normal';
        }
      }
    }

    // 3. Overall Risk level estimation
    if (hypertension === 'Crisis' || (diabetes === 'Diabetes' && (hypertension === 'Stage 2' || hypertension === 'Stage 1'))) {
      overall = 'CRITICAL';
      recommendations = ['Urgent clinic referral', 'Initiate pharmacological prescription', 'Check blood pressure daily', 'Restrict sodium and sugars'];
    } else if (hypertension === 'Stage 2' || diabetes === 'Diabetes') {
      overall = 'HIGH';
      recommendations = ['Medical officer consultation', 'Lifestyle alterations & diet control', 'Monitor blood glucose weekly'];
    } else if (hypertension === 'Stage 1' || hypertension === 'Prehypertension' || diabetes === 'Prediabetes') {
      overall = 'MODERATE';
      recommendations = ['Dietary modification (dash diet)', 'Increase regular aerobic exercises', 'Re-check metrics in 30 days'];
    } else {
      overall = 'LOW';
      recommendations = ['Maintain general healthy lifestyle', 'Re-screen at next annual campaign'];
    }

    return {
      riskClassifications: { hypertension, diabetes, overall },
      overall,
      recommendations
    };
  }
}
