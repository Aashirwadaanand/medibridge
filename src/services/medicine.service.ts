import Medicine from '../models/medicine.model';
import { IMedicine } from '../types/medicine.interface';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { Types } from 'mongoose';

export class MedicineService {
  /**
   * Add a new medicine record in inventory (Pharmacy only).
   */
  public static async createMedicine(
    pharmacyId: string,
    data: {
      name: string;
      genericName: string;
      manufacturer: string;
      price: number;
      stock: number;
      expiryDate: string;
      category: string;
      requiresPrescription?: boolean;
    }
  ): Promise<IMedicine> {
    const medicine = new Medicine({
      name: data.name,
      genericName: data.genericName,
      manufacturer: data.manufacturer,
      price: data.price,
      stock: data.stock,
      expiryDate: new Date(data.expiryDate),
      pharmacyId: new Types.ObjectId(pharmacyId),
      category: data.category,
      requiresPrescription: data.requiresPrescription || false,
    });

    await medicine.save();
    return medicine;
  }

  /**
   * List medicine inventory items (with optional filters).
   */
  public static async listMedicines(filters: { pharmacyId?: string } = {}): Promise<IMedicine[]> {
    const query: any = {};

    if (filters.pharmacyId && Types.ObjectId.isValid(filters.pharmacyId)) {
      query.pharmacyId = new Types.ObjectId(filters.pharmacyId);
    }

    return Medicine.find(query)
      .populate('pharmacyId', 'name email role')
      .sort({ name: 1 });
  }

  /**
   * Fetch single medicine entry by ID.
   */
  public static async getMedicineById(medicineId: string): Promise<IMedicine> {
    const medicine = await Medicine.findById(medicineId).populate('pharmacyId', 'name email role');
    if (!medicine) {
      throw new NotFoundError('Medicine item not found in inventory.');
    }
    return medicine;
  }

  /**
   * Update medicine inventory entry details (Pharmacy owners or admin only).
   */
  public static async updateMedicine(
    medicineId: string,
    pharmacyId: string,
    role: string,
    data: {
      name?: string;
      genericName?: string;
      manufacturer?: string;
      price?: number;
      stock?: number;
      expiryDate?: string;
      category?: string;
      requiresPrescription?: boolean;
    }
  ): Promise<IMedicine> {
    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      throw new NotFoundError('Medicine item not found in inventory.');
    }

    // Security check: Only the pharmacy owner who posted it (or admin) can modify it
    const isOwner = medicine.pharmacyId.toString() === pharmacyId;
    const isAdmin = role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('Access denied. You can only update inventory items belonging to your pharmacy.');
    }

    if (data.name !== undefined) medicine.name = data.name;
    if (data.genericName !== undefined) medicine.genericName = data.genericName;
    if (data.manufacturer !== undefined) medicine.manufacturer = data.manufacturer;
    if (data.price !== undefined) medicine.price = data.price;
    if (data.stock !== undefined) medicine.stock = data.stock;
    if (data.expiryDate !== undefined) medicine.expiryDate = new Date(data.expiryDate);
    if (data.category !== undefined) medicine.category = data.category;
    if (data.requiresPrescription !== undefined) medicine.requiresPrescription = data.requiresPrescription;

    await medicine.save();
    return medicine;
  }

  /**
   * Delete medicine inventory entry (Pharmacy owners or admin only).
   */
  public static async deleteMedicine(medicineId: string, pharmacyId: string, role: string): Promise<void> {
    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      throw new NotFoundError('Medicine item not found in inventory.');
    }

    // Security check: Only the pharmacy owner who posted it (or admin) can delete it
    const isOwner = medicine.pharmacyId.toString() === pharmacyId;
    const isAdmin = role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('Access denied. You can only delete inventory items belonging to your pharmacy.');
    }

    await Medicine.findByIdAndDelete(medicineId);
  }
}
export default MedicineService;
