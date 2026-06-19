import { IReportService } from '../../core/interfaces/IReportService';
import { MedicalReport } from '../../types';
import { delay, STORAGE } from '../../config/appMode';
import { getCollection, saveCollection, seedDemoDb } from '../_demoDb';

const KEY = STORAGE.DEMO_DB.REPORTS;

function getReports(): MedicalReport[] {
  seedDemoDb();
  return getCollection<MedicalReport>(KEY);
}

export const demoReportService: IReportService = {
  async getReports(): Promise<MedicalReport[]> {
    await delay(800);
    return getReports();
  },

  async uploadReport(title: string, _file: File): Promise<MedicalReport> {
    await delay(1500);
    const newReport: MedicalReport = {
      id: `rep_${Date.now()}`,
      patientId: 'user_pat_01',
      patientName: 'Anshuman Das',
      title,
      uploadDate: new Date().toISOString(),
      status: 'processing',
    };
    const list = getReports();
    list.unshift(newReport);
    saveCollection(KEY, list);
    return newReport;
  },

  async getParsedInsights(id: string): Promise<MedicalReport['parsedInsights'] | undefined> {
    await delay(400);
    return getReports().find((r) => r.id === id)?.parsedInsights;
  },
};
