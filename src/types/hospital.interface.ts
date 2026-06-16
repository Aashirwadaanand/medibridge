import { Document } from 'mongoose';

export interface IHospital extends Document {
  name: string;
  location: string;
  address: string;
  contactNumber: string;
  specialists: string[];
  bedsAvailable: number;
  emergencyAvailable: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}
