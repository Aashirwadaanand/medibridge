"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionService = void 0;
const prescription_model_1 = __importDefault(require("../models/prescription.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
class PrescriptionService {
    /**
     * Create a new prescription (Doctors only).
     */
    static async createPrescription(doctorId, patientId, data) {
        // 1. Verify patient user exists and is actually a patient
        const patient = await user_model_1.default.findById(patientId);
        if (!patient || patient.role !== 'patient') {
            throw new errors_1.BadRequestError('The designated patient was not found or is invalid.');
        }
        // 2. Create the prescription record
        const prescription = new prescription_model_1.default({
            doctorId: new mongoose_1.Types.ObjectId(doctorId),
            patientId: new mongoose_1.Types.ObjectId(patientId),
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
    static async listPrescriptions(userId, role) {
        let filter = {};
        if (role === 'patient') {
            filter = { patientId: new mongoose_1.Types.ObjectId(userId) };
        }
        else if (role === 'doctor') {
            filter = { doctorId: new mongoose_1.Types.ObjectId(userId) };
        }
        else if (role === 'admin') {
            filter = {};
        }
        else {
            throw new errors_1.ForbiddenError('You do not have permission to view prescriptions.');
        }
        return prescription_model_1.default.find(filter)
            .populate('patientId', 'name email role')
            .populate('doctorId', 'name email role')
            .sort({ createdAt: -1 });
    }
    /**
     * Update an existing prescription (Only creator doctor can update).
     */
    static async updatePrescription(prescriptionId, doctorId, role, data) {
        const prescription = await prescription_model_1.default.findById(prescriptionId);
        if (!prescription) {
            throw new errors_1.NotFoundError('Prescription not found.');
        }
        // Authorization check: Only the doctor who wrote it (or admin) can modify it
        const isAuthor = prescription.doctorId.toString() === doctorId;
        const isAdmin = role === 'admin';
        if (!isAuthor && !isAdmin) {
            throw new errors_1.ForbiddenError('Access denied. You can only update prescriptions you authored.');
        }
        // Update fields if provided
        if (data.medicines !== undefined)
            prescription.medicines = data.medicines;
        if (data.dosage !== undefined)
            prescription.dosage = data.dosage;
        if (data.instructions !== undefined)
            prescription.instructions = data.instructions;
        await prescription.save();
        return prescription;
    }
    /**
     * Delete an existing prescription (Only creator doctor or admin can delete).
     */
    static async deletePrescription(prescriptionId, doctorId, role) {
        const prescription = await prescription_model_1.default.findById(prescriptionId);
        if (!prescription) {
            throw new errors_1.NotFoundError('Prescription not found.');
        }
        // Authorization check: Only creator doctor or admin
        const isAuthor = prescription.doctorId.toString() === doctorId;
        const isAdmin = role === 'admin';
        if (!isAuthor && !isAdmin) {
            throw new errors_1.ForbiddenError('Access denied. You can only delete prescriptions you authored.');
        }
        await prescription_model_1.default.findByIdAndDelete(prescriptionId);
    }
}
exports.PrescriptionService = PrescriptionService;
exports.default = PrescriptionService;
