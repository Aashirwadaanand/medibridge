import { Document, Types } from 'mongoose';

export interface IMedicine extends Document {
  name: string;
  genericName: string;
  manufacturer: string;
  price: number;
  stock: number;
  expiryDate: Date;
  pharmacyId: Types.ObjectId;
  category: string;
  requiresPrescription: boolean;
  createdAt: Date;
  updatedAt: Date;
}
