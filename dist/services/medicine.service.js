"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicineService = void 0;
const medicine_model_1 = __importDefault(require("../models/medicine.model"));
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
class MedicineService {
    /**
     * Add a new medicine record in inventory (Pharmacy only).
     */
    static async createMedicine(pharmacyId, data) {
        const medicine = new medicine_model_1.default({
            name: data.name,
            genericName: data.genericName,
            manufacturer: data.manufacturer,
            price: data.price,
            stock: data.stock,
            expiryDate: new Date(data.expiryDate),
            pharmacyId: new mongoose_1.Types.ObjectId(pharmacyId),
            category: data.category,
            requiresPrescription: data.requiresPrescription || false,
        });
        await medicine.save();
        return medicine;
    }
    /**
     * List medicine inventory items (with optional filters).
     */
    static async listMedicines(filters = {}) {
        const query = {};
        if (filters.pharmacyId && mongoose_1.Types.ObjectId.isValid(filters.pharmacyId)) {
            query.pharmacyId = new mongoose_1.Types.ObjectId(filters.pharmacyId);
        }
        return medicine_model_1.default.find(query)
            .populate('pharmacyId', 'name email role')
            .sort({ name: 1 });
    }
    /**
     * Fetch single medicine entry by ID.
     */
    static async getMedicineById(medicineId) {
        const medicine = await medicine_model_1.default.findById(medicineId).populate('pharmacyId', 'name email role');
        if (!medicine) {
            throw new errors_1.NotFoundError('Medicine item not found in inventory.');
        }
        return medicine;
    }
    /**
     * Update medicine inventory entry details (Pharmacy owners or admin only).
     */
    static async updateMedicine(medicineId, pharmacyId, role, data) {
        const medicine = await medicine_model_1.default.findById(medicineId);
        if (!medicine) {
            throw new errors_1.NotFoundError('Medicine item not found in inventory.');
        }
        // Security check: Only the pharmacy owner who posted it (or admin) can modify it
        const isOwner = medicine.pharmacyId.toString() === pharmacyId;
        const isAdmin = role === 'admin';
        if (!isOwner && !isAdmin) {
            throw new errors_1.ForbiddenError('Access denied. You can only update inventory items belonging to your pharmacy.');
        }
        if (data.name !== undefined)
            medicine.name = data.name;
        if (data.genericName !== undefined)
            medicine.genericName = data.genericName;
        if (data.manufacturer !== undefined)
            medicine.manufacturer = data.manufacturer;
        if (data.price !== undefined)
            medicine.price = data.price;
        if (data.stock !== undefined)
            medicine.stock = data.stock;
        if (data.expiryDate !== undefined)
            medicine.expiryDate = new Date(data.expiryDate);
        if (data.category !== undefined)
            medicine.category = data.category;
        if (data.requiresPrescription !== undefined)
            medicine.requiresPrescription = data.requiresPrescription;
        await medicine.save();
        return medicine;
    }
    /**
     * Delete medicine inventory entry (Pharmacy owners or admin only).
     */
    static async deleteMedicine(medicineId, pharmacyId, role) {
        const medicine = await medicine_model_1.default.findById(medicineId);
        if (!medicine) {
            throw new errors_1.NotFoundError('Medicine item not found in inventory.');
        }
        // Security check: Only the pharmacy owner who posted it (or admin) can delete it
        const isOwner = medicine.pharmacyId.toString() === pharmacyId;
        const isAdmin = role === 'admin';
        if (!isOwner && !isAdmin) {
            throw new errors_1.ForbiddenError('Access denied. You can only delete inventory items belonging to your pharmacy.');
        }
        await medicine_model_1.default.findByIdAndDelete(medicineId);
    }
}
exports.MedicineService = MedicineService;
exports.default = MedicineService;
