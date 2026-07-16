import { IScreeningService } from '../../core/interfaces/IScreeningService';
import { Screening } from '../../types';
import { delay, STORAGE } from '../../config/appMode';
import { getCollection, saveCollection, seedDemoDb } from '../_demoDb';
import { RiskEngine } from '../../clinicalRules';

const KEY = STORAGE.DEMO_DB.SCREENINGS;

function getScreenings(): Screening[] {
  seedDemoDb();
  return getCollection<Screening>(KEY);
}

export const demoScreeningService: IScreeningService = {
  async getScreenings(): Promise<Screening[]> {
    await delay(600);
    return getScreenings();
  },

  async getScreeningById(id: string): Promise<Screening> {
    await delay(300);
    const item = getScreenings().find((s) => s.id === id);
    if (!item) throw new Error('Screening not found');
    return item;
  },

  async createScreening(data: {
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
  }): Promise<Screening> {
    await delay(1200);
    const engineResult = RiskEngine.calculateRisk(data.screeningType, data.readings);

    const newScreening: Screening = {
      id: `scr_${Date.now()}`,
      patientId: data.patientId,
      patientName: data.patientName,
      chwId: 'user_chw_01',
      chwName: 'Ramesh Kumar',
      screeningType: data.screeningType as any,
      readings: data.readings,
      riskClassifications: engineResult.riskClassifications,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const list = getScreenings();
    list.unshift(newScreening);
    saveCollection(KEY, list);
    
    // Dispatch refresh event
    window.dispatchEvent(new Event('medibridge-demo-refresh'));
    
    return newScreening;
  },

  async reviewScreening(
    id: string,
    data: {
      doctorNotes: string;
      actionTaken: string;
      followUpDate?: string;
    }
  ): Promise<Screening> {
    await delay(1000);
    const list = getScreenings();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Screening not found');

    const updated: Screening = {
      ...list[idx],
      doctorId: 'user_doc_01',
      doctorName: 'Dr. Sarika Sharma',
      doctorNotes: data.doctorNotes,
      actionTaken: data.actionTaken,
      followUpDate: data.followUpDate,
      followUpStatus: data.followUpDate ? 'pending' : 'none',
      status: 'reviewed',
    };

    list[idx] = updated;
    saveCollection(KEY, list);
    
    window.dispatchEvent(new Event('medibridge-demo-refresh'));
    
    return updated;
  },

  async updateFollowUpStatus(
    id: string,
    status: 'pending' | 'completed' | 'none'
  ): Promise<Screening> {
    await delay(500);
    const list = getScreenings();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Screening not found');

    const updated: Screening = {
      ...list[idx],
      followUpStatus: status,
    };

    list[idx] = updated;
    saveCollection(KEY, list);

    window.dispatchEvent(new Event('medibridge-demo-refresh'));

    return updated;
  },
};
