import { Document, Types } from 'mongoose';

export enum ScreeningType {
  HYPERTENSION_DIABETES = 'Hypertension/Diabetes',
  NCD = 'NCD',
  ANEMIA = 'Anemia',
  TB = 'Tuberculosis',
  MATERNAL = 'Maternal'
}

export interface IScreening extends Document {
  patientId: Types.ObjectId;
  chwId: Types.ObjectId;
  doctorId?: Types.ObjectId;
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
  followUpDate?: Date;
  followUpStatus?: 'pending' | 'completed' | 'none';
  createdAt: Date;
  updatedAt: Date;
}
