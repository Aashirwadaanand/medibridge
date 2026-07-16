import { Screening } from '../../types';

export interface IScreeningService {
  getScreenings(): Promise<Screening[]>;
  getScreeningById(id: string): Promise<Screening>;
  createScreening(data: {
    patientId: string;
    patientName: string;
    screeningType: string;
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
  }): Promise<Screening>;
  reviewScreening(
    id: string,
    data: {
      doctorNotes: string;
      actionTaken: string;
      followUpDate?: string;
    }
  ): Promise<Screening>;
}
