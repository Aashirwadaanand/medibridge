"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const appointment_routes_1 = __importDefault(require("./appointment.routes"));
const report_routes_1 = __importDefault(require("./report.routes"));
const prescription_routes_1 = __importDefault(require("./prescription.routes"));
const hospital_routes_1 = __importDefault(require("./hospital.routes"));
const medicine_routes_1 = __importDefault(require("./medicine.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const ai_routes_1 = __importDefault(require("./ai.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const screening_routes_1 = __importDefault(require("./screening.routes"));
const router = (0, express_1.Router)();
/**
 * Health Check Endpoint
 * GET /api/health
 */
router.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'MEDIBRIDGE Server is running healthy.',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// Mount authentication routes under '/auth'
router.use('/auth', auth_routes_1.default);
// Mount appointment routes under '/appointments'
router.use('/appointments', appointment_routes_1.default);
// Mount report routes under '/reports'
router.use('/reports', report_routes_1.default);
// Mount prescription routes under '/prescriptions'
router.use('/prescriptions', prescription_routes_1.default);
// Mount hospital routes under '/hospitals'
router.use('/hospitals', hospital_routes_1.default);
// Mount medicine routes under '/medicines'
router.use('/medicines', medicine_routes_1.default);
// Mount notification routes under '/notifications'
router.use('/notifications', notification_routes_1.default);
// Mount AI assistant routes under '/ai'
router.use('/ai', ai_routes_1.default);
// Mount administrative routes under '/admin'
router.use('/admin', admin_routes_1.default);
// Mount screening routes under '/screenings'
router.use('/screenings', screening_routes_1.default);
exports.default = router;
