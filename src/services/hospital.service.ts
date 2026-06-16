import Hospital from '../models/hospital.model';
import { IHospital } from '../types/hospital.interface';
import { NotFoundError } from '../utils/errors';

export class HospitalService {
  /**
   * Create a new hospital entry.
   */
  public static async createHospital(data: {
    name: string;
    location: string;
    address: string;
    contactNumber: string;
    specialists?: string[];
    bedsAvailable?: number;
    emergencyAvailable?: boolean;
    rating?: number;
  }): Promise<IHospital> {
    const hospital = new Hospital(data);
    await hospital.save();
    return hospital;
  }

  /**
   * List all hospital entries.
   */
  public static async listHospitals(): Promise<IHospital[]> {
    return Hospital.find().sort({ name: 1 });
  }

  /**
   * Retrieve a hospital by ID.
   */
  public static async getHospitalById(hospitalId: string): Promise<IHospital> {
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      throw new NotFoundError('Hospital registry entry not found.');
    }
    return hospital;
  }

  /**
   * Update hospital details.
   */
  public static async updateHospital(
    hospitalId: string,
    data: {
      name?: string;
      location?: string;
      address?: string;
      contactNumber?: string;
      specialists?: string[];
      bedsAvailable?: number;
      emergencyAvailable?: boolean;
      rating?: number;
    }
  ): Promise<IHospital> {
    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      throw new NotFoundError('Hospital registry entry not found.');
    }

    // Assign properties dynamically
    if (data.name !== undefined) hospital.name = data.name;
    if (data.location !== undefined) hospital.location = data.location;
    if (data.address !== undefined) hospital.address = data.address;
    if (data.contactNumber !== undefined) hospital.contactNumber = data.contactNumber;
    if (data.specialists !== undefined) hospital.specialists = data.specialists;
    if (data.bedsAvailable !== undefined) hospital.bedsAvailable = data.bedsAvailable;
    if (data.emergencyAvailable !== undefined) hospital.emergencyAvailable = data.emergencyAvailable;
    if (data.rating !== undefined) hospital.rating = data.rating;

    await hospital.save();
    return hospital;
  }

  /**
   * Delete a hospital entry.
   */
  public static async deleteHospital(hospitalId: string): Promise<void> {
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      throw new NotFoundError('Hospital registry entry not found.');
    }
    await Hospital.findByIdAndDelete(hospitalId);
  }
}
export default HospitalService;
