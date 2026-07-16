export class AnemiaRules {
  public static calculate(readings: { hemoglobin?: number; isPregnant?: boolean; ageGroup?: 'child' | 'adolescent' | 'adult' }) {
    const hb = readings.hemoglobin || 0;
    const isPregnant = readings.isPregnant || false;
    const ageGroup = readings.ageGroup || 'adult';

    let anemia: 'Normal' | 'Mild' | 'Moderate' | 'Severe' = 'Normal';
    let overall: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let recommendations: string[] = [];

    if (isPregnant) {
      if (hb < 7.0) {
        anemia = 'Severe';
        overall = 'CRITICAL';
        recommendations = ['Start double dose IFA daily', 'Immediate hospital referral', 'Repeat Hb in 15 days', 'Nutritional counseling'];
      } else if (hb >= 7.0 && hb <= 9.9) {
        anemia = 'Moderate';
        overall = 'HIGH';
        recommendations = ['Start daily IFA tablets', 'Iron-rich diet counseling', 'Repeat Hb in 30 days'];
      } else if (hb >= 10.0 && hb <= 10.9) {
        anemia = 'Mild';
        overall = 'MODERATE';
        recommendations = ['Start daily IFA tablets', 'Nutrition counseling', 'Repeat Hb in 60 days'];
      } else {
        anemia = 'Normal';
        overall = 'LOW';
        recommendations = ['Routine prenatal care', 'Standard prophylactic IFA daily', 'Balanced iron-rich diet'];
      }
    } else if (ageGroup === 'child') {
      if (hb < 7.0) {
        anemia = 'Severe';
        overall = 'CRITICAL';
        recommendations = ['Refer to pediatrician immediately', 'Pediatric iron drops prescription', 'Repeat Hb in 15 days', 'Nutrition guidance'];
      } else if (hb >= 7.0 && hb <= 9.9) {
        anemia = 'Moderate';
        overall = 'HIGH';
        recommendations = ['Pediatric iron syrup daily', 'Balanced nutrition & iron rich foods', 'Repeat Hb in 30 days'];
      } else if (hb >= 10.0 && hb <= 10.9) {
        anemia = 'Mild';
        overall = 'MODERATE';
        recommendations = ['Nutrition advice for growth', 'Daily pediatric iron drops', 'Repeat Hb in 60 days'];
      } else {
        anemia = 'Normal';
        overall = 'LOW';
        recommendations = ['Maintain balanced child growth diet', 'Regular screening every 6 months'];
      }
    } else if (ageGroup === 'adolescent') {
      if (hb < 8.0) {
        anemia = 'Severe';
        overall = 'CRITICAL';
        recommendations = ['Refer for clinical evaluation', 'Start daily therapeutic IFA drops/tablets', 'Repeat Hb in 15 days', 'Nutritionist referral'];
      } else if (hb >= 8.0 && hb <= 10.9) {
        anemia = 'Moderate';
        overall = 'HIGH';
        recommendations = ['Weekly iron supplement', 'High-iron diet counseling', 'Repeat Hb in 30 days'];
      } else if (hb >= 11.0 && hb <= 11.4) {
        anemia = 'Mild';
        overall = 'MODERATE';
        recommendations = ['Weekly iron supplement', 'Nutrition counseling', 'Repeat Hb in 60 days'];
      } else {
        anemia = 'Normal';
        overall = 'LOW';
        recommendations = ['Prophylactic weekly iron supplementation (WIFS)', 'General healthy diet guidelines'];
      }
    } else {
      // Adult non-pregnant
      if (hb < 8.0) {
        anemia = 'Severe';
        overall = 'CRITICAL';
        recommendations = ['Refer to general physician', 'Daily therapeutic IFA tablets', 'Repeat Hb in 15 days', 'Nutrition counseling'];
      } else if (hb >= 8.0 && hb <= 10.9) {
        anemia = 'Moderate';
        overall = 'HIGH';
        recommendations = ['Daily IFA tablet', 'Dietary iron advisory', 'Repeat Hb in 30 days'];
      } else if (hb >= 11.0 && hb <= 11.9) {
        anemia = 'Mild';
        overall = 'MODERATE';
        recommendations = ['Daily IFA tablet', 'Nutrition counseling', 'Repeat Hb in 60 days'];
      } else {
        anemia = 'Normal';
        overall = 'LOW';
        recommendations = ['Balanced diet with iron & vitamin C source', 'Periodic annual checkups'];
      }
    }

    return {
      riskClassifications: { anemia, overall },
      overall,
      recommendations
    };
  }
}
