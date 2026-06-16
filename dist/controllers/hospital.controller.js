"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HospitalController = void 0;
const hospital_service_1 = __importDefault(require("../services/hospital.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
class HospitalController {
    /**
     * Register a new hospital
     * POST /api/hospitals
     */
    static createHospital = (0, asyncHandler_1.default)(async (req, res) => {
        const { name, location, address, contactNumber, specialists, bedsAvailable, emergencyAvailable, rating } = req.body;
        const hospital = await hospital_service_1.default.createHospital({
            name,
            location,
            address,
            contactNumber,
            specialists,
            bedsAvailable,
            emergencyAvailable,
            rating,
        });
        res.status(201).json({
            status: 'success',
            message: 'Hospital registered successfully.',
            data: {
                hospital,
            },
        });
    });
    /**
     * List all registered hospitals
     * GET /api/hospitals
     */
    static listHospitals = (0, asyncHandler_1.default)(async (_req, res) => {
        const hospitals = await hospital_service_1.default.listHospitals();
        res.status(200).json({
            status: 'success',
            results: hospitals.length,
            data: {
                hospitals,
            },
        });
    });
    /**
     * Fetch single hospital details
     * GET /api/hospitals/:id
     */
    static getHospitalById = (0, asyncHandler_1.default)(async (req, res) => {
        const hospitalId = req.params.id;
        const hospital = await hospital_service_1.default.getHospitalById(hospitalId);
        res.status(200).json({
            status: 'success',
            data: {
                hospital,
            },
        });
    });
    /**
     * Update hospital registry details
     * PUT /api/hospitals/:id
     */
    static updateHospital = (0, asyncHandler_1.default)(async (req, res) => {
        const hospitalId = req.params.id;
        const { name, location, address, contactNumber, specialists, bedsAvailable, emergencyAvailable, rating } = req.body;
        const hospital = await hospital_service_1.default.updateHospital(hospitalId, {
            name,
            location,
            address,
            contactNumber,
            specialists,
            bedsAvailable,
            emergencyAvailable,
            rating,
        });
        res.status(200).json({
            status: 'success',
            message: 'Hospital details updated successfully.',
            data: {
                hospital,
            },
        });
    });
    /**
     * Update hospital beds capacity
     * PATCH /api/hospitals/:id/beds
     */
    static updateBeds = (0, asyncHandler_1.default)(async (req, res) => {
        const hospitalId = req.params.id;
        const { bedsAvailable } = req.body;
        const hospital = await hospital_service_1.default.updateHospital(hospitalId, {
            bedsAvailable,
        });
        res.status(200).json({
            status: 'success',
            message: 'Hospital beds capacity updated successfully.',
            data: {
                hospital,
            },
        });
    });
    /**
     * Delete hospital entry
     * DELETE /api/hospitals/:id
     */
    static deleteHospital = (0, asyncHandler_1.default)(async (req, res) => {
        const hospitalId = req.params.id;
        await hospital_service_1.default.deleteHospital(hospitalId);
        res.status(200).json({
            status: 'success',
            message: 'Hospital registry entry deleted successfully.',
        });
    });
}
exports.HospitalController = HospitalController;
exports.default = HospitalController;
