"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const report_service_1 = __importDefault(require("../services/report.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const errors_1 = require("../utils/errors");
class ReportController {
    /**
     * Upload/Create a new medical report
     * POST /api/reports
     */
    static uploadReport = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const doctorId = req.user.id;
        const { patientId, reportType, title, description, fileURL, doctorNotes } = req.body;
        const report = await report_service_1.default.uploadReport(doctorId, patientId, {
            reportType,
            title,
            description,
            fileURL,
            doctorNotes,
        });
        res.status(201).json({
            status: 'success',
            message: 'Medical report uploaded successfully.',
            data: {
                report,
            },
        });
    });
    /**
     * List reports (filters automatically by user role)
     * GET /api/reports
     */
    static listReports = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const reports = await report_service_1.default.listReports(req.user.id, req.user.role);
        res.status(200).json({
            status: 'success',
            results: reports.length,
            data: {
                reports,
            },
        });
    });
    /**
     * Fetch single medical report by ID
     * GET /api/reports/:id
     */
    static getReportById = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const reportId = req.params.id;
        const userId = req.user.id;
        const role = req.user.role;
        const report = await report_service_1.default.getReportById(reportId, userId, role);
        res.status(200).json({
            status: 'success',
            data: {
                report,
            },
        });
    });
    /**
     * Delete a medical report
     * DELETE /api/reports/:id
     */
    static deleteReport = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const reportId = req.params.id;
        const userId = req.user.id;
        const role = req.user.role;
        await report_service_1.default.deleteReport(reportId, userId, role);
        res.status(200).json({
            status: 'success',
            message: 'Medical report deleted successfully.',
        });
    });
}
exports.ReportController = ReportController;
exports.default = ReportController;
