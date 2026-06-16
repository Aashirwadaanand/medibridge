"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicineController = void 0;
const medicine_service_1 = __importDefault(require("../services/medicine.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const errors_1 = require("../utils/errors");
class MedicineController {
    /**
     * Add a new medicine record in inventory
     * POST /api/medicines
     */
    static createMedicine = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const pharmacyId = req.user.id;
        const { name, genericName, manufacturer, price, stock, expiryDate, category, requiresPrescription } = req.body;
        const medicine = await medicine_service_1.default.createMedicine(pharmacyId, {
            name,
            genericName,
            manufacturer,
            price,
            stock,
            expiryDate,
            category,
            requiresPrescription,
        });
        res.status(201).json({
            status: 'success',
            message: 'Medicine added to inventory successfully.',
            data: {
                medicine,
            },
        });
    });
    /**
     * List all medicine inventory items
     * GET /api/medicines
     */
    static listMedicines = (0, asyncHandler_1.default)(async (req, res) => {
        // Allows filtering by query parameter pharmacyId (e.g. /api/medicines?pharmacyId=abc)
        const { pharmacyId } = req.query;
        const medicines = await medicine_service_1.default.listMedicines({
            pharmacyId: pharmacyId ? String(pharmacyId) : undefined,
        });
        res.status(200).json({
            status: 'success',
            results: medicines.length,
            data: {
                medicines,
            },
        });
    });
    /**
     * Fetch single medicine details
     * GET /api/medicines/:id
     */
    static getMedicineById = (0, asyncHandler_1.default)(async (req, res) => {
        const medicineId = req.params.id;
        const medicine = await medicine_service_1.default.getMedicineById(medicineId);
        res.status(200).json({
            status: 'success',
            data: {
                medicine,
            },
        });
    });
    /**
     * Update medicine inventory entry details
     * PUT /api/medicines/:id
     */
    static updateMedicine = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const medicineId = req.params.id;
        const pharmacyId = req.user.id;
        const role = req.user.role;
        const { name, genericName, manufacturer, price, stock, expiryDate, category, requiresPrescription } = req.body;
        const medicine = await medicine_service_1.default.updateMedicine(medicineId, pharmacyId, role, {
            name,
            genericName,
            manufacturer,
            price,
            stock,
            expiryDate,
            category,
            requiresPrescription,
        });
        res.status(200).json({
            status: 'success',
            message: 'Medicine inventory details updated successfully.',
            data: {
                medicine,
            },
        });
    });
    /**
     * Delete medicine inventory entry
     * DELETE /api/medicines/:id
     */
    static deleteMedicine = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const medicineId = req.params.id;
        const pharmacyId = req.user.id;
        const role = req.user.role;
        await medicine_service_1.default.deleteMedicine(medicineId, pharmacyId, role);
        res.status(200).json({
            status: 'success',
            message: 'Medicine inventory record deleted successfully.',
        });
    });
}
exports.MedicineController = MedicineController;
exports.default = MedicineController;
