import { Prescription } from '../../types';

export interface IPrescriptionService {
  getPrescriptions(): Promise<Prescription[]>;
  createPrescription(prescription: Omit<Prescription, 'id' | 'date' | 'status'>): Promise<Prescription>;
}
