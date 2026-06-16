import { Document, Types } from 'mongoose';

export type ReportType = 'Lab' | 'Imaging' | 'Prescription' | 'General';

export interface IReport extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  reportType: ReportType;
  title: string;
  description: string;
  fileURL: string;
  doctorNotes?: string;
  uploadDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
