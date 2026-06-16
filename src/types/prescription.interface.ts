import { Document, Types } from 'mongoose';

export interface IPrescription extends Document {
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  medicines: string[];
  dosage: string;
  instructions: string;
  createdAt: Date;
  updatedAt: Date;
}
