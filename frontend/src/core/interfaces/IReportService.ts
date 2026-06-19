import { MedicalReport } from '../../types';

export interface IReportService {
  getReports(): Promise<MedicalReport[]>;
  uploadReport(title: string, file: File): Promise<MedicalReport>;
  getParsedInsights(id: string): Promise<MedicalReport['parsedInsights'] | undefined>;
}
