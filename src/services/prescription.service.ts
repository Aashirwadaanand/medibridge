import Prescription from '../models/prescription.model';
import User from '../models/user.model';
import { IPrescription } from '../types/prescription.interface';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { Types } from 'mongoose';

export class PrescriptionService {
  /**
   * Create a new prescription (Doctors only).
   */
  public static async createPrescription(
    doctorId: string,
    patientId: string,
    data: {
      medicines: string[];
      dosage: string;
      instructions: string;
    }
  ): Promise<IPrescription> {
    // 1. Verify patient user exists and is actually a patient
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      throw new BadRequestError('The designated patient was not found or is invalid.');
    }

    // 2. Create the prescription record
    const prescription = new Prescription({
      doctorId: new Types.ObjectId(doctorId),
      patientId: new Types.ObjectId(patientId),
      medicines: data.medicines,
      dosage: data.dosage,
      instructions: data.instructions,
    });

    await prescription.save();
    return prescription;
  }

  /**
   * List prescriptions based on the requester's identity/role.
   */
  public static async listPrescriptions(userId: string, role: string): Promise<IPrescription[]> {
    let filter = {};

    if (role === 'patient') {
      filter = { patientId: new Types.ObjectId(userId) };
    } else if (role === 'doctor') {
      filter = { doctorId: new Types.ObjectId(userId) };
    } else if (role === 'admin') {
      filter = {};
    } else {
      throw new ForbiddenError('You do not have permission to view prescriptions.');
    }

    return Prescription.find(filter)
      .populate('patientId', 'name email role')
      .populate('doctorId', 'name email role')
      .sort({ createdAt: -1 });
  }

  /**
   * Update an existing prescription (Only creator doctor can update).
   */
  public static async updatePrescription(
    prescriptionId: string,
    doctorId: string,
    role: string,
    data: {
      medicines?: string[];
      dosage?: string;
      instructions?: string;
    }
  ): Promise<IPrescription> {
    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) {
      throw new NotFoundError('Prescription not found.');
    }

    // Authorization check: Only the doctor who wrote it (or admin) can modify it
    const isAuthor = prescription.doctorId.toString() === doctorId;
    const isAdmin = role === 'admin';

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenError('Access denied. You can only update prescriptions you authored.');
    }

    // Update fields if provided
    if (data.medicines !== undefined) prescription.medicines = data.medicines;
    if (data.dosage !== undefined) prescription.dosage = data.dosage;
    if (data.instructions !== undefined) prescription.instructions = data.instructions;

    await prescription.save();
    return prescription;
  }

  /**
   * Delete an existing prescription (Only creator doctor or admin can delete).
   */
  public static async deletePrescription(
    prescriptionId: string,
    doctorId: string,
    role: string
  ): Promise<void> {
    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) {
      throw new NotFoundError('Prescription not found.');
    }

    // Authorization check: Only creator doctor or admin
    const isAuthor = prescription.doctorId.toString() === doctorId;
    const isAdmin = role === 'admin';

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenError('Access denied. You can only delete prescriptions you authored.');
    }

    await Prescription.findByIdAndDelete(prescriptionId);
  }
}
export default PrescriptionService;
