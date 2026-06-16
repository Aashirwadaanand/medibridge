import { Document, Types } from 'mongoose';

export type AppointmentStatus = 'Pending' | 'Approved' | 'Completed' | 'Cancelled';

export interface IAppointment extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  date: Date;
  time: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}
