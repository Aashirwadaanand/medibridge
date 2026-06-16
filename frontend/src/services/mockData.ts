import { User, Appointment, Medicine, MedicalReport, Prescription, Hospital, Notification } from '../types';

export const mockUsers: Record<string, User> = {
  patient: {
    id: 'user_pat_01',
    name: 'Anshuman Das',
    email: 'patient@medibridge.com',
    role: 'patient',
    token: 'mock-jwt-token-patient',
    createdAt: '2026-06-10T12:00:00Z'
  },
  doctor: {
    id: 'user_doc_01',
    name: 'Dr. Sarika Sharma',
    email: 'doctor@medibridge.com',
    role: 'doctor',
    token: 'mock-jwt-token-doctor',
    createdAt: '2026-06-08T09:30:00Z'
  },
  hospital: {
    id: 'user_hosp_01',
    name: 'Apollo Hospital Delhi',
    email: 'hospital@medibridge.com',
    role: 'hospital',
    token: 'mock-jwt-token-hospital',
    createdAt: '2026-06-05T08:00:00Z'
  },
  admin: {
    id: 'user_adm_01',
    name: 'System Operations Control',
    email: 'admin@medibridge.com',
    role: 'admin',
    token: 'mock-jwt-token-admin',
    createdAt: '2026-06-01T07:15:00Z'
  }
};

export const mockVitalsHistory = [
  { time: '08:00', bp: '120/80', heartRate: 72, temp: 98.6, oxygen: 99 },
  { time: '10:00', bp: '118/79', heartRate: 75, temp: 98.4, oxygen: 98 },
  { time: '12:00', bp: '122/81', heartRate: 81, temp: 98.7, oxygen: 99 },
  { time: '14:00', bp: '125/83', heartRate: 88, temp: 99.0, oxygen: 97 },
  { time: '16:00', bp: '119/80', heartRate: 74, temp: 98.5, oxygen: 99 },
  { time: '18:00', bp: '121/80', heartRate: 70, temp: 98.3, oxygen: 98 },
  { time: '20:00', bp: '117/78', heartRate: 68, temp: 98.1, oxygen: 99 }
];

export const mockEmergencyContacts = [
  { name: 'Dr. Sarika Sharma (Cardiologist)', relation: 'Primary Specialist', phone: '+91 98765 43210', status: 'Available' },
  { name: 'Neha Das', relation: 'Spouse / Emergency proxy', phone: '+91 98123 45678', status: 'Primary' },
  { name: 'Delhi Emergency EMS Dispatcher', relation: 'Public Service', phone: '102', status: '24/7' }
];

export const mockEmergencyTimeline = [
  { id: 'et_1', time: '16:00', title: 'Adverse Vitals Flagged', description: 'Wearable reported heart rate spike to 118 bpm during rest state.', alert: true },
  { id: 'et_2', time: '16:05', title: 'Automated Dispatch Check', description: 'Patient responded to wearable check-in; dashboard switched to warning status.', alert: false },
  { id: 'et_3', time: '16:15', title: 'Ambulance ETA Updated', description: 'Standby vehicle designated at Delhi Central Ambulance Depot.', alert: false }
];

// Seed lists for procedural generation
const INDIAN_FIRST_NAMES = [
  'Anshuman', 'Sarika', 'Rajesh', 'Manish', 'Neha', 'Priya', 'Amit', 'Sunita', 'Sanjay', 'Vikram',
  'Rahul', 'Pooja', 'Deepak', 'Nisha', 'Vijay', 'Ritu', 'Suresh', 'Kavita', 'Anil', 'Meena',
  'Arvind', 'Jyoti', 'Ramesh', 'Swati', 'Alok', 'Divya', 'Karan', 'Aditi', 'Raj', 'Komal',
  'Rohit', 'Sapna', 'Gaurav', 'Kajal', 'Harish', 'Preeti', 'Manoj', 'Anjali', 'Sandeep', 'Poonam',
  'Vikash', 'Rekha', 'Yogesh', 'Babita', 'Abhishek', 'Nitu', 'Vivek', 'Suman', 'Rakesh', 'Aarti',
  'Chirag', 'Tanu', 'Nikhil', 'Tanvi', 'Abhay', 'Shalini', 'Varun', 'Renu', 'Tarun', 'Anisha'
];

const INDIAN_LAST_NAMES = [
  'Das', 'Sharma', 'Patel', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Joshi', 'Mehta', 'Nair',
  'Reddy', 'Rao', 'Sen', 'Bose', 'Roy', 'Iyer', 'Pillai', 'Choudhury', 'Banerjee', 'Chatterjee',
  'Mishra', 'Trivedi', 'Pandey', 'Dwivedi', 'Shukla', 'Dubey', 'Pathak', 'Tiwari', 'Saxena', 'Sinha',
  'Bhatt', 'Kulkarni', 'Deshmukh', 'Joshi', 'Gokhale', 'Modi', 'Shah', 'Mahajan', 'Puri', 'Malhotra'
];

const SPECIALTIES = [
  'Cardiology', 'Pediatrics', 'Neurology', 'Orthopedics', 'Dermatology', 'Oncology',
  'Endocrinology', 'Ophthalmology', 'General Medicine', 'Pulmonology', 'Gastroenterology', 'Gynecology'
];

const CITIES = ['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Noida', 'Gurgaon'];

const MEDICINES_SEED = [
  { name: 'Atorvastatin', generic: 'Lipitor', category: 'Cardiovascular', price: 180 },
  { name: 'Lisinopril', generic: 'Prinivil', category: 'Hypertension', price: 120 },
  { name: 'Metformin', generic: 'Glucophage', category: 'Antidiabetic', price: 95 },
  { name: 'Ibuprofen', generic: 'Advil', category: 'Analgesics', price: 70 },
  { name: 'Paracetamol', generic: 'Crocin', category: 'Analgesics', price: 20 },
  { name: 'Pantoprazole', generic: 'Pan-40', category: 'Gastrointestinal', price: 140 },
  { name: 'Montelukast', generic: 'Singulair', category: 'Respiratory', price: 110 },
  { name: 'Amlodipine', generic: 'Norvasc', category: 'Hypertension', price: 80 },
  { name: 'Amoxicillin', generic: 'Novamox', category: 'Antibiotics', price: 150 },
  { name: 'Telmisartan', generic: 'Telma-40', category: 'Hypertension', price: 90 },
  { name: 'Metoprolol', generic: 'Metolar', category: 'Cardiovascular', price: 105 },
  { name: 'Levothyroxine', generic: 'Thyronorm', category: 'Supplements', price: 130 },
  { name: 'Cetirizine', generic: 'Cetzine', category: 'Antihistamines', price: 35 },
  { name: 'Clopidogrel', generic: 'Plavix', category: 'Cardiovascular', price: 165 },
  { name: 'Rabeprazole', generic: 'Razo-20', category: 'Gastrointestinal', price: 125 }
];

const REPORT_TITLES = [
  'Comprehensive Lipid Panel', 'Cardiac Magnetic Resonance Imaging (MRI)', 'Full Blood Count (CBC)',
  'Thyroid Stimulating Hormone (TSH) Profile', 'Renal Function Telemetry', 'Liver Function Panel (LFT)',
  'Glycated Hemoglobin (HbA1c) Analysis', 'Vitamin D3 & B12 Screening'
];

const REASONS = [
  'Routine Cardiovascular Check-up', 'Hypertension Telemetry Review', 'Diabetic Management Evaluation',
  'Chronic Pain Management Session', 'Seasonal Allergy Diagnosis', 'Gastric Acid Reflux Review',
  'Thyroid Hormone Check', 'Neurological Nerve Checkup', 'Annual Physical Telemetry'
];

// Helper to get random item
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Procedural Generator Function
export const generateDemoDatabase = () => {
  const patients: User[] = [];
  const doctors: any[] = [];
  const hospitals: Hospital[] = [];
  const medicines: Medicine[] = [];
  const appointments: Appointment[] = [];
  const prescriptions: Prescription[] = [];
  const reports: MedicalReport[] = [];
  const notifications: Notification[] = [];
  const emergencyAlerts: any[] = [];

  // 1. Generate 15 Hospitals
  const hospitalNames = ['Apollo Hospital', 'Fortis Hospital', 'Max Super Speciality', 'Medanta Medicentre', 'Sir Ganga Ram Hospital', 'Manipal Care Hospital'];
  for (let i = 1; i <= 15; i++) {
    const city = randomItem(CITIES);
    const name = `${randomItem(hospitalNames)} ${city}`;
    hospitals.push({
      id: `hosp_${i}`,
      name,
      location: `${randomRange(1, 99)} Outer Circle, Sector ${randomRange(1, 20)}, ${city}`,
      address: `${randomRange(100, 999)} Metro Ring Road, ${city}, India`,
      contactNumber: `+91 98${randomRange(10000000, 99999999)}`,
      specialists: [randomItem(SPECIALTIES), randomItem(SPECIALTIES), randomItem(SPECIALTIES)],
      bedsAvailable: randomRange(5, 75),
      emergencyAvailable: Math.random() > 0.2,
      rating: parseFloat((4.0 + Math.random()).toFixed(1))
    });
  }

  // Ensure hospital user has an entry matching user_hosp_01
  hospitals[0] = {
    id: 'user_hosp_01',
    name: 'Apollo Hospital Delhi',
    location: 'Connaught Place, Delhi',
    address: '456 Outer Circle, Connaught Place, New Delhi, 110001',
    contactNumber: '+91 98765 43210',
    specialists: ['Cardiology', 'Neurology', 'Oncology', 'Emergency Medicine'],
    bedsAvailable: 42,
    emergencyAvailable: true,
    rating: 4.8
  };

  // 2. Generate 25 Doctors
  for (let i = 1; i <= 25; i++) {
    const fName = randomItem(INDIAN_FIRST_NAMES);
    const lName = randomItem(INDIAN_LAST_NAMES);
    const specialty = randomItem(SPECIALTIES);
    const hosp = randomItem(hospitals);
    doctors.push({
      id: `doc_${i}`,
      name: `Dr. ${fName} ${lName}`,
      specialty,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}@medibridge.io`,
      phone: `+91 98${randomRange(10000000, 99999999)}`,
      hospitalId: hosp.id,
      hospitalName: hosp.name
    });
  }

  // Ensure doctor matching user_doc_01 exists
  doctors[0] = {
    id: 'user_doc_01',
    name: 'Dr. Sarika Sharma',
    specialty: 'Cardiology',
    email: 'doctor@medibridge.com',
    phone: '+91 98765 43210',
    hospitalId: 'user_hosp_01',
    hospitalName: 'Apollo Hospital Delhi'
  };

  // 3. Generate 50 Patients
  for (let i = 1; i <= 50; i++) {
    const fName = randomItem(INDIAN_FIRST_NAMES);
    const lName = randomItem(INDIAN_LAST_NAMES);
    const city = randomItem(CITIES);
    patients.push({
      id: `pat_${i}`,
      name: `${fName} ${lName}`,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}@gmail.com`,
      role: 'patient',
      createdAt: new Date(Date.now() - randomRange(10, 365) * 24 * 60 * 60 * 1000).toISOString()
    });

    // Save profile metadata in localStorage to keep custom edit values
    const profile = {
      phone: `+91 98${randomRange(10000000, 99999999)}`,
      gender: randomItem(['male', 'female', 'other']),
      dob: `19${randomRange(50, 99)}-${randomRange(10, 12).toString().padStart(2, '0')}-${randomRange(10, 28).toString().padStart(2, '0')}`,
      address: `${randomRange(10, 150)} Park Lane, Sector ${randomRange(1, 15)}, ${city}`,
      medicalHistory: randomItem([
        ['Hypertension', 'Seasonal Allergies'],
        ['Diabetes Type II', 'Obesity'],
        ['Asthma', 'Acid Reflux'],
        ['Baseline Healthy', 'No major conditions'],
        ['Hyperlipidemia', 'Osteoarthritis']
      ]),
      allergies: randomItem([
        ['Penicillin'],
        ['Sulfa Drugs', 'Aspirin'],
        ['Peanuts', 'Shellfish'],
        ['None reported'],
        ['Dairy', 'Gluten']
      ])
    };
    localStorage.setItem(`medibridge_profile_pat_${i}`, JSON.stringify(profile));
  }

  // Ensure patient matching user_pat_01 exists
  patients[0] = {
    id: 'user_pat_01',
    name: 'Anshuman Das',
    email: 'patient@medibridge.com',
    role: 'patient',
    createdAt: '2026-06-10T12:00:00Z'
  };
  localStorage.setItem('medibridge_profile_user_pat_01', JSON.stringify({
    phone: '+91 98123 45678',
    gender: 'male',
    dob: '1985-08-15',
    address: 'Sector 45, Gurgaon, Haryana',
    medicalHistory: ['Mild Hypertension', 'Hyperlipidemia'],
    allergies: ['Penicillin', 'Dust Mites']
  }));

  // 4. Generate 100 Medicines
  const manufacturers = ['Cipla Ltd.', 'Sun Pharmaceutical Industries', "Dr. Reddy's Laboratories", 'Dabur India Ltd.', 'Lupin Limited', 'Aurobindo Pharma'];
  const genericPrefixes = ['Zydus', 'Novartis', 'GlaxoSmith', 'Pfizer', 'Abbott'];
  for (let i = 1; i <= 100; i++) {
    const base = randomItem(MEDICINES_SEED);
    medicines.push({
      id: `med_${i}`,
      name: i <= MEDICINES_SEED.length ? base.name : `${base.name}-${randomRange(10, 500)}mg`,
      genericName: `${randomItem(genericPrefixes)} ${base.generic}`,
      manufacturer: randomItem(manufacturers),
      price: parseFloat((base.price + randomRange(-15, 60)).toFixed(2)),
      stock: randomRange(5, 500),
      expiryDate: `2027-${randomRange(10, 12).toString().padStart(2, '0')}-${randomRange(10, 28).toString().padStart(2, '0')}`,
      pharmacyId: `pharma_${randomRange(1, 3)}`,
      category: base.category,
      requiresPrescription: Math.random() > 0.4
    });
  }

  // Ensure default catalog medicines are loaded
  medicines[0] = {
    id: 'med_01',
    name: 'Atorvastatin',
    genericName: 'Lipitor',
    manufacturer: 'Cipla Ltd.',
    price: 180.00,
    stock: 120,
    expiryDate: '2027-12-31',
    pharmacyId: 'pharma_01',
    category: 'Cardiovascular',
    requiresPrescription: true
  };
  medicines[1] = {
    id: 'med_02',
    name: 'Lisinopril',
    genericName: 'Prinivil',
    manufacturer: 'Sun Pharmaceutical Industries',
    price: 120.00,
    stock: 85,
    expiryDate: '2027-08-15',
    pharmacyId: 'pharma_01',
    category: 'Hypertension',
    requiresPrescription: true
  };

  // 5. Generate 55 Appointments
  const statuses: Appointment['status'][] = ['pending', 'approved', 'cancelled', 'completed'];
  for (let i = 1; i <= 55; i++) {
    const patient = randomItem(patients);
    const doctor = randomItem(doctors);
    const hosp = randomItem(hospitals);
    const status = i <= 5 ? 'pending' : randomItem(statuses);
    const apptDate = new Date(Date.now() + randomRange(-10, 20) * 24 * 60 * 60 * 1000);
    appointments.push({
      id: `appt_${i}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      dateTime: apptDate.toISOString(),
      status,
      reason: randomItem(REASONS),
      notes: status === 'completed' ? 'Vitals normal, recommended low-carb diet check.' : undefined
    });
  }

  // Ensure default appt exists for user_pat_01
  appointments[0] = {
    id: 'appt_01',
    patientId: 'user_pat_01',
    patientName: 'Anshuman Das',
    doctorId: 'user_doc_01',
    doctorName: 'Dr. Sarika Sharma',
    hospitalId: 'user_hosp_01',
    hospitalName: 'Apollo Hospital Delhi',
    dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    status: 'approved',
    reason: 'Cardiovascular Follow-up Consultation',
    notes: 'Please bring your blood pressure readings for the last 14 days.'
  };

  // 6. Generate 50 Prescriptions
  for (let i = 1; i <= 50; i++) {
    const patient = randomItem(patients);
    const doctor = randomItem(doctors);
    const numMeds = randomRange(1, 3);
    const medItems = [];
    for (let m = 0; m < numMeds; m++) {
      const medObj = randomItem(medicines);
      medItems.push({
        medicineName: medObj.name,
        dosage: `${randomRange(5, 500)}mg`,
        frequency: randomItem(['Once daily', 'Twice daily', 'Thrice daily', 'Before sleep']),
        duration: `${randomRange(7, 90)} days`
      });
    }

    prescriptions.push({
      id: `pres_${i}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: new Date(Date.now() - randomRange(1, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: randomItem(['active', 'completed', 'expired']),
      medicines: medItems,
      instructions: 'Take after meals. Drink plenty of water.'
    });
  }

  // Ensure default prescription exists for user_pat_01
  prescriptions[0] = {
    id: 'pres_01',
    patientId: 'user_pat_01',
    patientName: 'Anshuman Das',
    doctorId: 'user_doc_01',
    doctorName: 'Dr. Sarika Sharma',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    medicines: [
      { medicineName: 'Lisinopril', dosage: '10mg', frequency: 'Once daily (morning)', duration: '90 days' },
      { medicineName: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily (bedtime)', duration: '90 days' }
    ],
    instructions: 'Take blood pressure readings at least twice daily and log them in the Medibridge tracker.'
  };

  // 7. Generate 30 Medical Reports
  const findings = [
    'Blood sugar slightly elevated.', 'Lungs clear on auscultation.', 'EKG reveals slight sinus tachycardia.',
    'LDL cholesterol above normal target.', 'Hemoglobin levels optimal.', 'Vitamin D deficiency flagged.',
    'Mild left ventricular hypertrophy.', 'Thyroid parameters in normal range.'
  ];
  for (let i = 1; i <= 30; i++) {
    const patient = randomItem(patients);
    const title = randomItem(REPORT_TITLES);
    reports.push({
      id: `rep_${i}`,
      patientId: patient.id,
      patientName: patient.name,
      title,
      uploadDate: new Date(Date.now() - randomRange(1, 40) * 24 * 60 * 60 * 1000).toISOString(),
      status: randomItem(['completed', 'processing', 'failed']),
      parsedInsights: {
        summary: `Routine checkup details indicating stable vitals. ${randomItem(findings)}`,
        criticalFindings: [randomItem(findings)],
        recommendations: ['Maintain low-sodium diet.', 'Follow up with practitioner in 3 weeks.']
      }
    });
  }

  // Ensure default report for user_pat_01
  reports[0] = {
    id: 'rep_01',
    patientId: 'user_pat_01',
    patientName: 'Anshuman Das',
    title: 'Comprehensive Lipids Panel',
    uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    parsedInsights: {
      summary: 'Total cholesterol levels are slightly elevated. HDL (Good Cholesterol) is in the optimal range.',
      criticalFindings: ['LDL Cholesterol: 145 mg/dL', 'Total Cholesterol: 218 mg/dL'],
      recommendations: ['Maintain low-sodium, low-saturated fat diet.', 'Follow up with Dr. Sarika Sharma.']
    }
  };

  // 8. Generate 30 Notifications
  const notifTypes: Notification['type'][] = ['appointment', 'medicine', 'prescription', 'followup', 'emergency', 'general'];
  const titles = ['Emergency Warning', 'Pill Refill', 'Appt Confirmed', 'New Lab Report', 'Doctor Message', 'General System Alert'];
  const messages = [
    'Extreme Temperature Warning: Take extra cardiovascular precautions today.',
    'Your medication supply has dropped below 10 days. Request refill.',
    'Meeting approved with clinic staff.',
    'Full Blood Count (CBC) report results compiling.',
    'Please review your daily logs and maintain hydration.',
    'MEDIBRIDGE platform services upgraded successfully.'
  ];
  for (let i = 1; i <= 35; i++) {
    const patient = randomItem(patients);
    const typeIdx = randomRange(0, 5);
    notifications.push({
      id: `not_${Date.now()}_${i}`,
      userId: patient.id,
      title: titles[typeIdx],
      message: messages[typeIdx],
      type: notifTypes[typeIdx],
      isRead: Math.random() > 0.4,
      createdAt: new Date(Date.now() - randomRange(1, 240) * 10 * 60 * 1000).toISOString()
    });
  }

  // Ensure notifications for default patient exists
  const specificNotifs = [
    { title: 'Emergency Alert', message: 'Extreme Temperature Warning: Take extra cardiovascular precautions today.', type: 'emergency' as const, isRead: false },
    { title: 'Medication Refill Reminder', message: 'Your Lisinopril supply has dropped below 10 days. Request a refill soon.', type: 'medicine' as const, isRead: false },
    { title: 'Cardiology Appointment Confirmed', message: 'Your meeting with Dr. Sarika Sharma on June 18th has been approved.', type: 'appointment' as const, isRead: false },
    { title: 'New Lab Report Available', message: 'Your Full Blood Count (CBC) report results are currently compiling.', type: 'general' as const, isRead: true }
  ];
  specificNotifs.forEach((n, idx) => {
    notifications.push({
      id: `not_pat_01_${idx}`,
      userId: 'user_pat_01',
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: new Date(Date.now() - idx * 60 * 60 * 1000).toISOString()
    });
  });

  // 9. Generate 10 Emergency Alerts
  for (let i = 1; i <= 10; i++) {
    const patient = randomItem(patients);
    emergencyAlerts.push({
      id: `alert_${i}`,
      patientId: patient.id,
      patientName: patient.name,
      triggeredAt: new Date(Date.now() - randomRange(1, 48) * 60 * 60 * 1000).toISOString(),
      riskLevel: randomItem(['MODERATE', 'HIGH', 'CRITICAL']),
      status: randomItem(['dispatched', 'en_route', 'arrived', 'idle'])
    });
  }

  // Save to localStorage
  localStorage.setItem('medibridge_demo_patients', JSON.stringify(patients));
  localStorage.setItem('medibridge_demo_doctors', JSON.stringify(doctors));
  localStorage.setItem('medibridge_demo_hospitals', JSON.stringify(hospitals));
  localStorage.setItem('medibridge_demo_medicines', JSON.stringify(medicines));
  localStorage.setItem('medibridge_demo_appointments', JSON.stringify(appointments));
  localStorage.setItem('medibridge_demo_prescriptions', JSON.stringify(prescriptions));
  localStorage.setItem('medibridge_demo_reports', JSON.stringify(reports));
  localStorage.setItem('medibridge_demo_notifications', JSON.stringify(notifications));
  localStorage.setItem('medibridge_demo_emergency_alerts', JSON.stringify(emergencyAlerts));
  localStorage.setItem('medibridge_demo_initialized', 'true');
};

// Initialize database
if (!localStorage.getItem('medibridge_demo_initialized')) {
  generateDemoDatabase();
}

// Helper to reload arrays from localStorage
const getStoredList = <T>(key: string): T[] => {
  return JSON.parse(localStorage.getItem(key) || '[]');
};

const saveStoredList = <T>(key: string, list: T[]) => {
  localStorage.setItem(key, JSON.stringify(list));
};

// Export arrays mapped to local storage for dynamic updates
export let mockAppointments: Appointment[] = getStoredList('medibridge_demo_appointments');
export let mockMedicines: Medicine[] = getStoredList('medibridge_demo_medicines');
export let mockReports: MedicalReport[] = getStoredList('medibridge_demo_reports');
export let mockPrescriptions: Prescription[] = getStoredList('medibridge_demo_prescriptions');
export let mockHospitals: Hospital[] = getStoredList('medibridge_demo_hospitals');
export let mockNotifications: Notification[] = getStoredList('medibridge_demo_notifications');

export const syncInMemoryCache = () => {
  mockAppointments = getStoredList('medibridge_demo_appointments');
  mockMedicines = getStoredList('medibridge_demo_medicines');
  mockReports = getStoredList('medibridge_demo_reports');
  mockPrescriptions = getStoredList('medibridge_demo_prescriptions');
  mockHospitals = getStoredList('medibridge_demo_hospitals');
  mockNotifications = getStoredList('medibridge_demo_notifications');
};

// Mode selector getter
export const isDemoMode = () => {
  return (localStorage.getItem('medibridge_app_mode') || 'demo') === 'demo';
};

// Data Management Operations
export const resetDemoData = () => {
  // Regenerates initial sets
  generateDemoDatabase();
  syncInMemoryCache();
};

export const seedDemoDatabase = () => {
  // Generate additional records
  const curAppts = getStoredList<Appointment>('medibridge_demo_appointments');
  const curPresc = getStoredList<Prescription>('medibridge_demo_prescriptions');
  const curReps = getStoredList<MedicalReport>('medibridge_demo_reports');
  const curNotifs = getStoredList<Notification>('medibridge_demo_notifications');

  const patients = getStoredList<User>('medibridge_demo_patients');
  const doctors = getStoredList<any>('medibridge_demo_doctors');
  const hospitals = getStoredList<Hospital>('medibridge_demo_hospitals');
  const medicines = getStoredList<Medicine>('medibridge_demo_medicines');

  // Add 10 appointments, 10 prescriptions, 5 reports, 5 notifications
  for (let i = 0; i < 10; i++) {
    const p = randomItem(patients);
    const d = randomItem(doctors);
    const h = randomItem(hospitals);
    curAppts.push({
      id: `appt_seed_${Date.now()}_${i}`,
      patientId: p.id,
      patientName: p.name,
      doctorId: d.id,
      doctorName: d.name,
      hospitalId: h.id,
      hospitalName: h.name,
      dateTime: new Date(Date.now() + randomRange(1, 15) * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      reason: randomItem(REASONS)
    });

    const numMeds = randomRange(1, 2);
    const medItems = [];
    for (let m = 0; m < numMeds; m++) {
      const med = randomItem(medicines);
      medItems.push({
        medicineName: med.name,
        dosage: '100mg',
        frequency: 'Once daily',
        duration: '15 days'
      });
    }
    curPresc.push({
      id: `pres_seed_${Date.now()}_${i}`,
      patientId: p.id,
      patientName: p.name,
      doctorId: d.id,
      doctorName: d.name,
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      medicines: medItems
    });
  }

  for (let i = 0; i < 5; i++) {
    const p = randomItem(patients);
    curReps.push({
      id: `rep_seed_${Date.now()}_${i}`,
      patientId: p.id,
      patientName: p.name,
      title: randomItem(REPORT_TITLES),
      uploadDate: new Date().toISOString(),
      status: 'completed',
      parsedInsights: {
        summary: 'Seeded test results showing baseline parameters.',
        criticalFindings: ['All metrics within healthy deviation'],
        recommendations: ['Routine vitals check in 30 days']
      }
    });

    curNotifs.push({
      id: `not_seed_${Date.now()}_${i}`,
      userId: p.id,
      title: 'Seeded Telemetry Update',
      message: 'New clinical insights and logs have been compiled.',
      type: 'general',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveStoredList('medibridge_demo_appointments', curAppts);
  saveStoredList('medibridge_demo_prescriptions', curPresc);
  saveStoredList('medibridge_demo_reports', curReps);
  saveStoredList('medibridge_demo_notifications', curNotifs);
  syncInMemoryCache();
};

export const clearDemoNotifications = () => {
  saveStoredList('medibridge_demo_notifications', []);
  syncInMemoryCache();
};

export const restoreFactoryDefaults = () => {
  localStorage.removeItem('medibridge_demo_initialized');
  localStorage.setItem('medibridge_app_mode', 'demo');
  generateDemoDatabase();
  syncInMemoryCache();
};

export interface EmergencyState {
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  sosActive: boolean;
  sosTriggeredAt?: string;
  ambulanceStatus?: 'dispatched' | 'en_route' | 'arrived' | 'returning' | 'idle';
  ambulanceEtaMinutes?: number;
  ambulanceDistanceKm?: number;
}

export const mockEmergencyState: EmergencyState = {
  riskLevel: 'MODERATE',
  sosActive: false,
  ambulanceStatus: 'idle'
};
