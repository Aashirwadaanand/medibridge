"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionController = void 0;
const prescription_service_1 = __importDefault(require("../services/prescription.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const errors_1 = require("../utils/errors");
class PrescriptionController {
    /**
     * Create a new prescription
     * POST /api/prescriptions
     */
    static createPrescription = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const doctorId = req.user.id;
        const { patientId, medicines, dosage, instructions } = req.body;
        const prescription = await prescription_service_1.default.createPrescription(doctorId, patientId, {
            medicines,
            dosage,
            instructions,
        });
        res.status(201).json({
            status: 'success',
            message: 'Prescription created successfully.',
            data: {
                prescription,
            },
        });
    });
    /**
     * List prescriptions (filters automatically by user role)
     * GET /api/prescriptions
     */
    static listPrescriptions = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const prescriptions = await prescription_service_1.default.listPrescriptions(req.user.id, req.user.role);
        res.status(200).json({
            status: 'success',
            results: prescriptions.length,
            data: {
                prescriptions,
            },
        });
    });
    /**
     * Update an existing prescription
     * PUT /api/prescriptions/:id
     */
    static updatePrescription = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const prescriptionId = req.params.id;
        const doctorId = req.user.id;
        const role = req.user.role;
        const { medicines, dosage, instructions } = req.body;
        const prescription = await prescription_service_1.default.updatePrescription(prescriptionId, doctorId, role, {
            medicines,
            dosage,
            instructions,
        });
        res.status(200).json({
            status: 'success',
            message: 'Prescription updated successfully.',
            data: {
                prescription,
            },
        });
    });
    /**
     * Delete an existing prescription
     * DELETE /api/prescriptions/:id
     */
    static deletePrescription = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const prescriptionId = req.params.id;
        const doctorId = req.user.id;
        const role = req.user.role;
        await prescription_service_1.default.deletePrescription(prescriptionId, doctorId, role);
        res.status(200).json({
            status: 'success',
            message: 'Prescription deleted successfully.',
        });
    });
}
exports.PrescriptionController = PrescriptionController;
exports.default = PrescriptionController;
