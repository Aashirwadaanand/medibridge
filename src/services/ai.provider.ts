

export interface IAiProvider {
  analyzeSymptoms(symptoms: string): Promise<any>;
  analyzeMedicalReport(title: string, content: string): Promise<any>;
  generateHealthInsights(patientHistory: any): Promise<any>;
  recommendMedicines(symptoms: string, allergies: string[]): Promise<any>;
  calculateRiskScore(symptoms: string, vitals: any): Promise<any>;
  checkInteractions(med1: string, med2: string): Promise<any>;
}

/**
 * Strips markdown formatting and parses JSON safely.
 */
function cleanAndParseJson(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  }
  return JSON.parse(cleaned);
}

/**
 * Communicates with Google Gemini API to return structured clinical data.
 */
export class GeminiProvider implements IAiProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callGemini(prompt: string): Promise<any> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error status ${response.status}: ${errorText}`);
      }

      const responseData: any = await response.json();
      const generatedText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('Empty response received from Gemini API.');
      }

      return cleanAndParseJson(generatedText);
    } catch (error) {
      console.error('Error in callGemini API request:', error);
      throw error;
    }
  }

  async analyzeSymptoms(symptoms: string): Promise<any> {
    const prompt = `You are a medical assistant integrated into MEDIBRIDGE. 
Analyze the following patient symptom report: "${symptoms}".
You MUST return a valid JSON object matching this schema. Do not output any other text or markdown block formatting.
JSON Schema:
{
  "summary": "Clinical summary of symptoms.",
  "possibleCauses": ["cause 1", "cause 2"],
  "riskLevel": "Low" | "Moderate" | "Critical",
  "recommendations": ["rec 1", "rec 2"],
  "suggestedTests": ["test 1", "test 2"]
}`;
    return this.callGemini(prompt);
  }

  async analyzeMedicalReport(title: string, content: string): Promise<any> {
    const prompt = `You are a clinical report analyzer for MEDIBRIDGE.
Analyze this report: "${title}" with content details: "${content}".
You MUST return a valid JSON object matching this schema. Do not output any other text or markdown block formatting.
JSON Schema:
{
  "summary": "Brief summary of the report.",
  "keyMetrics": [
    { "name": "metric name", "value": "reading value", "status": "Normal" | "High" | "Low" }
  ],
  "findings": ["finding 1", "finding 2"],
  "recommendations": ["rec 1", "rec 2"]
}`;
    return this.callGemini(prompt);
  }

  async generateHealthInsights(patientHistory: any): Promise<any> {
    const historyStr = typeof patientHistory === 'object' ? JSON.stringify(patientHistory) : String(patientHistory);
    const prompt = `You are a personalized clinical wellness assistant for MEDIBRIDGE.
Generate personalized wellness insights based on this patient medical history: "${historyStr}".
You MUST return a valid JSON object matching this schema. Do not output any other text or markdown block formatting.
JSON Schema:
{
  "summary": "A brief overview of the patient's current health status based on records.",
  "lifestyleTips": ["lifestyle tip 1", "lifestyle tip 2"],
  "healthRisks": ["risk 1", "risk 2"],
  "followUps": ["followup check 1", "followup check 2"]
}`;
    return this.callGemini(prompt);
  }

  async recommendMedicines(symptoms: string, allergies: string[]): Promise<any> {
    const allergiesStr = allergies.join(', ');
    const prompt = `You are an AI clinical pharmacology assistant for MEDIBRIDGE.
Suggest over-the-counter or common medicine suggestions for symptoms: "${symptoms}". 
CRITICAL: The patient reported allergies: "${allergiesStr}". DO NOT recommend medicines containing these allergens or their active drug classes.
You MUST return a valid JSON object matching this schema. Do not output any other text or markdown block formatting.
JSON Schema:
{
  "medicines": [
    { "name": "brand or generic name", "genericName": "generic component", "dosage": "e.g. 500mg", "frequency": "e.g. Once daily after food", "reason": "why it is suggested" }
  ],
  "precautions": ["precaution 1", "precaution 2"]
}`;
    return this.callGemini(prompt);
  }

  async calculateRiskScore(symptoms: string, vitals: any): Promise<any> {
    const vitalsStr = typeof vitals === 'object' ? JSON.stringify(vitals) : String(vitals);
    const prompt = `You are a clinical triage risk calculator for MEDIBRIDGE.
Calculate a clinical risk score based on symptoms: "${symptoms}" and vitals parameters: "${vitalsStr}".
You MUST return a valid JSON object matching this schema. Do not output any other text or markdown block formatting.
JSON Schema:
{
  "score": 0-100 integer representing severity risk,
  "level": "Low" | "Moderate" | "High" | "Critical",
  "primaryRiskFactors": ["risk factor 1", "risk factor 2"],
  "details": "Explanation of clinical indicators justifying this risk estimation."
}`;
    return this.callGemini(prompt);
  }

  async checkInteractions(med1: string, med2: string): Promise<any> {
    const prompt = `You are a clinical pharmacology assistant.
Analyze potential drug-to-drug interactions between medicine 1: "${med1}" and medicine 2: "${med2}".
You MUST return a valid JSON object matching this schema. Do not output any other text or markdown block formatting.
JSON Schema:
{
  "severity": "Low" | "Moderate" | "High",
  "description": "Explanation of the physiological mechanism of interaction or safety warning.",
  "precautions": ["precaution 1", "precaution 2"]
}`;
    return this.callGemini(prompt);
  }
}

/**
 * Simulated AI provider returning mock structured JSON data for offline Demo Mode.
 */
export class SimulatedProvider implements IAiProvider {
  async analyzeSymptoms(symptoms: string): Promise<any> {
    const query = symptoms.toLowerCase();
    let risk: 'Low' | 'Moderate' | 'Critical' = 'Moderate';
    let summary = 'Patient reports mild symptoms. Diagnostic evaluation recommended.';
    let causes = ['Viral Syndrome', 'Fatigue / Stress'];
    let recs = ['Rest and monitor temperature logs.', 'Maintain hydration (8+ glasses of water daily).'];
    let tests = ['Routine Blood Examination', 'Basic Metabolic Panel'];

    if (query.includes('chest') || query.includes('breath') || query.includes('heart') || query.includes('tightness')) {
      risk = 'Critical';
      summary = 'Patient indicates potential acute cardiopulmonary distress/angina symptoms.';
      causes = ['Myocardial Infarction / Angina', 'Acute Bronchospasm', 'Severe Anxiety Panic Attack'];
      recs = ['Initiate SOS trigger or visit emergency ER immediately.', 'Perform immediate 12-lead ECG.', 'Check oxygen saturation and blood pressure.'];
      tests = ['12-Lead Electrocardiogram (ECG)', 'Cardiac Troponin T/I Biomarkers', 'Chest X-Ray', 'Echocardiogram'];
    } else if (query.includes('fever') || query.includes('cough') || query.includes('throat')) {
      risk = 'Low';
      summary = 'Symptoms indicate standard upper respiratory viral infection or congestion.';
      causes = ['Common Influenza', 'Mild Acute Pharyngitis', 'Seasonal Allergy'];
      recs = ['Antipyretic/Paracetamol if temperature exceeds 101F.', 'Warm saline gargles thrice daily.', 'Rest for 48 hours.'];
      tests = ['Complete Blood Count (CBC) with Differential', 'Rapid Influenza Diagnostic Test (RIDT)', 'Throat Culture'];
    }

    return {
      summary,
      possibleCauses: causes,
      riskLevel: risk,
      recommendations: recs,
      suggestedTests: tests
    };
  }

  async analyzeMedicalReport(title: string, content: string): Promise<any> {
    const query = (title + ' ' + content).toLowerCase();
    let keyMetrics: { name: string; value: string; status: 'Normal' | 'High' | 'Low' }[] = [
      { name: 'Hemoglobin', value: '14.2 g/dL', status: 'Normal' as const },
      { name: 'WBC Count', value: '7,500 /uL', status: 'Normal' as const }
    ];
    let findings = ['All haematological values fall within normal standard reference ranges.', 'No acute infection markers detected.'];
    let recs = ['Continue standard balanced diet.', 'Re-screen in 12 months for routine wellness tracking.'];

    if (query.includes('cholesterol') || query.includes('lipid') || query.includes('ldl') || query.includes('hdl')) {
      keyMetrics = [
        { name: 'Total Cholesterol', value: '235 mg/dL', status: 'High' as const },
        { name: 'LDL Cholesterol', value: '158 mg/dL', status: 'High' as const },
        { name: 'HDL Cholesterol', value: '42 mg/dL', status: 'Normal' as const }
      ];
      findings = ['Total cholesterol and LDL levels are elevated beyond optimal range.', 'HDL cholesterol is stable but on the lower bound.'];
      recs = ['Switch to low-sodium, low-saturated fat diet.', 'Incorporate 30 minutes of aerobic exercise daily.', 'Re-test in 90 days.'];
    }

    return {
      summary: `Analyzed report for '${title}'.`,
      keyMetrics,
      findings,
      recommendations: recs
    };
  }

  async generateHealthInsights(_patientHistory: any): Promise<any> {
    return {
      summary: 'Personalized wellness profile based on chronic tracking logs.',
      lifestyleTips: [
        'Engage in 150 minutes of moderate intensity physical activity weekly.',
        'Adopt a DASH (Dietary Approaches to Stop Hypertension) diet rich in grains and vegetables.'
      ],
      healthRisks: [
        'Borderline hypertension risk due to historical telemetry spikes.',
        'Dehydration risk during high temperature logs.'
      ],
      followUps: [
        'Schedule primary wellness consultation next month.',
        'Record morning blood pressure twice weekly.'
      ]
    };
  }

  async recommendMedicines(symptoms: string, allergies: string[]): Promise<any> {
    const query = symptoms.toLowerCase();
    const hasPenicillinAllergy = allergies.some(a => a.toLowerCase().includes('penicillin'));
    
    let medicines = [
      { name: 'Paracetamol (Crocin)', genericName: 'Acetaminophen', dosage: '500mg', frequency: 'Thrice daily after food as needed', reason: 'For general fever and body ache relief.' }
    ];
    let precautions = ['Do not exceed 3g of Paracetamol in a 24-hour period.', 'Avoid alcohol consumption while taking Paracetamol.'];

    if (query.includes('cough') || query.includes('throat') || query.includes('congestion')) {
      medicines = [
        { name: 'Levocetirizine', genericName: 'Antihistamine', dosage: '5mg', frequency: 'Once daily before bedtime', reason: 'Relieves runny nose and sneezing.' },
        { name: 'Dextromethorphan Syrup', genericName: 'Cough Suppressant', dosage: '10ml', frequency: 'Thrice daily', reason: 'Soothes dry spasmodic cough.' }
      ];
      precautions = ['May cause mild drowsiness. Avoid driving or operating machinery.', 'Consult a physician if cough persists beyond 7 days.'];
    } else if (query.includes('infection') || query.includes('strep')) {
      if (hasPenicillinAllergy) {
        medicines = [
          { name: 'Azithromycin', genericName: 'Macrolide Antibiotic', dosage: '500mg', frequency: 'Once daily for 3 days', reason: 'Bacterial infection control (Penicillin-safe alternative).' }
        ];
      } else {
        medicines = [
          { name: 'Amoxicillin', genericName: 'Penicillin Antibiotic', dosage: '500mg', frequency: 'Thrice daily for 5 days', reason: 'First-line bacterial infection control.' }
        ];
      }
      precautions = ['Take the full course of antibiotics as prescribed. Do not skip doses.', 'May cause stomach upset. Take with food.'];
    }

    return {
      medicines,
      precautions
    };
  }

  async calculateRiskScore(symptoms: string, vitals: any): Promise<any> {
    const query = symptoms.toLowerCase();
    const heartRate = parseInt(vitals?.heartRate) || 75;
    const oxygen = parseInt(vitals?.oxygen) || 98;

    let score = 25;
    let level: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
    let risks = ['Elevated fatigue'];
    let details = 'Patient exhibits baseline healthy parameters with minor symptomatic distress.';

    if (heartRate > 110 || oxygen < 94 || query.includes('chest') || query.includes('breath') || query.includes('heart')) {
      score = 88;
      level = 'Critical';
      risks = ['Tachycardia', 'Hypoxia', 'Cardiac Strain'];
      details = `Critical vitals flagged: Heart Rate ${heartRate} bpm, Oxygen saturation ${oxygen}%. Urgently review EKG telemetry.`;
    } else if (heartRate > 90 || query.includes('fever') || query.includes('vomit')) {
      score = 52;
      level = 'Moderate';
      risks = ['Mild Dehydration', 'Pyrexia'];
      details = 'Vitals show moderate deviation from baseline. Patient requires regular hydration and fever checks.';
    }

    return {
      score,
      level,
      primaryRiskFactors: risks,
      details
    };
  }

  async checkInteractions(med1: string, med2: string): Promise<any> {
    const m1 = med1.toLowerCase();
    const m2 = med2.toLowerCase();
    let severity: 'Low' | 'Moderate' | 'High' = 'Low';
    let description = 'No clinically significant drug-to-drug interactions detected between the selected therapies.';
    let precautions = ['Ensure both medications are taken with standard compliance.', 'Take at separate times of the day if gastrointestinal discomfort occurs.'];

    if ((m1.includes('aspirin') && m2.includes('ibuprofen')) || (m1.includes('ibuprofen') && m2.includes('aspirin'))) {
      severity = 'Moderate';
      description = 'Concurrent use of NSAIDs like Aspirin and Ibuprofen may decrease the cardioprotective effect of Aspirin and increase risk of gastrointestinal bleeding/ulceration.';
      precautions = ['Monitor for signs of GI bleeding (dark stools, stomach pain).', 'Administer Ibuprofen at least 8 hours after or 30 minutes before Aspirin.', 'Consider prescribing a proton pump inhibitor (PPI) for gastric protection.'];
    } else if ((m1.includes('lisinopril') && m2.includes('spironolactone')) || (m1.includes('spironolactone') && m2.includes('lisinopril'))) {
      severity = 'High';
      description = 'Combining an ACE inhibitor (Lisinopril) with a potassium-sparing diuretic (Spironolactone) significantly increases the risk of severe hyperkalemia (high serum potassium levels).';
      precautions = ['Avoid potassium supplements or potassium-rich salt substitutes.', 'Check serum potassium and renal function panels within 1 week of initiating therapy.', 'Discontinue spironolactone immediately if potassium levels exceed 5.5 mEq/L.'];
    }

    return {
      severity,
      description,
      precautions
    };
  }
}
