export type UserRole = 'patient' | 'doctor' | 'hospital' | 'pharmacy' | 'admin' | 'chw';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
  createdAt?: string;
  isActive?: boolean;
  villageId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  dateTime: string;
  status: 'pending' | 'approved' | 'cancelled' | 'completed';
  reason: string;
  notes?: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  price: number;
  stock: number;
  expiryDate: string;
  pharmacyId: string;
  category: string;
  requiresPrescription: boolean;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  fileUrl?: string;
  uploadDate: string;
  parsedInsights?: {
    summary: string;
    criticalFindings: string[];
    recommendations: string[];
  };
  status: 'processing' | 'completed' | 'failed';
}

export interface PrescriptionItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  status: 'active' | 'completed' | 'expired';
  medicines: PrescriptionItem[];
  instructions?: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  address: string;
  contactNumber: string;
  specialists: string[];
  bedsAvailable: number;
  emergencyAvailable: boolean;
  rating: number;
}

export type NotificationType = 'appointment' | 'medicine' | 'prescription' | 'followup' | 'emergency' | 'general';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export enum ScreeningType {
  HYPERTENSION_DIABETES = 'Hypertension/Diabetes',
  NCD = 'NCD',
  ANEMIA = 'Anemia',
  TB = 'Tuberculosis',
  MATERNAL = 'Maternal'
}

export interface Screening {
  id: string;
  patientId: string;
  patientName: string;
  chwId: string;
  chwName: string;
  doctorId?: string;
  doctorName?: string;
  screeningType: ScreeningType;
  readings: {
    systolic?: number;
    diastolic?: number;
    bloodSugar?: number;
    bloodSugarType?: 'fasting' | 'random';
    hemoglobin?: number;
    tbSymptoms?: string[];
    isPregnant?: boolean;
    trimester?: number;
    ageGroup?: 'child' | 'adolescent' | 'adult';
    weight?: number;
    ifaStarted?: boolean;
  };
  riskClassifications: {
    hypertension?: 'Normal' | 'Prehypertension' | 'Stage 1' | 'Stage 2' | 'Crisis';
    diabetes?: 'Normal' | 'Prediabetes' | 'Diabetes';
    anemia?: string;
    tb?: string;
    overall: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  };
  status: 'pending' | 'reviewed';
  doctorNotes?: string;
  actionTaken?: string;
  followUpDate?: string;
  followUpStatus?: 'pending' | 'completed' | 'none';
  createdAt: string;
}
