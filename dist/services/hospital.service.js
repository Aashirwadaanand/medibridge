"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HospitalService = void 0;
const hospital_model_1 = __importDefault(require("../models/hospital.model"));
const errors_1 = require("../utils/errors");
class HospitalService {
    /**
     * Create a new hospital entry.
     */
    static async createHospital(data) {
        const hospital = new hospital_model_1.default(data);
        await hospital.save();
        return hospital;
    }
    /**
     * List all hospital entries.
     */
    static async listHospitals() {
        return hospital_model_1.default.find().sort({ name: 1 });
    }
    /**
     * Retrieve a hospital by ID.
     */
    static async getHospitalById(hospitalId) {
        const hospital = await hospital_model_1.default.findById(hospitalId);
        if (!hospital) {
            throw new errors_1.NotFoundError('Hospital registry entry not found.');
        }
        return hospital;
    }
    /**
     * Update hospital details.
     */
    static async updateHospital(hospitalId, data) {
        const hospital = await hospital_model_1.default.findById(hospitalId);
        if (!hospital) {
            throw new errors_1.NotFoundError('Hospital registry entry not found.');
        }
        // Assign properties dynamically
        if (data.name !== undefined)
            hospital.name = data.name;
        if (data.location !== undefined)
            hospital.location = data.location;
        if (data.address !== undefined)
            hospital.address = data.address;
        if (data.contactNumber !== undefined)
            hospital.contactNumber = data.contactNumber;
        if (data.specialists !== undefined)
            hospital.specialists = data.specialists;
        if (data.bedsAvailable !== undefined)
            hospital.bedsAvailable = data.bedsAvailable;
        if (data.emergencyAvailable !== undefined)
            hospital.emergencyAvailable = data.emergencyAvailable;
        if (data.rating !== undefined)
            hospital.rating = data.rating;
        await hospital.save();
        return hospital;
    }
    /**
     * Delete a hospital entry.
     */
    static async deleteHospital(hospitalId) {
        const hospital = await hospital_model_1.default.findById(hospitalId);
        if (!hospital) {
            throw new errors_1.NotFoundError('Hospital registry entry not found.');
        }
        await hospital_model_1.default.findByIdAndDelete(hospitalId);
    }
}
exports.HospitalService = HospitalService;
exports.default = HospitalService;
