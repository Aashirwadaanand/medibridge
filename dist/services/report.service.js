"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const report_model_1 = __importDefault(require("../models/report.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
class ReportService {
    /**
     * Upload/Create a new medical report (Doctors only).
     */
    static async uploadReport(doctorId, patientId, data) {
        // 1. Verify patient exists and actually holds the 'patient' role
        const patient = await user_model_1.default.findById(patientId);
        if (!patient || patient.role !== 'patient') {
            throw new errors_1.BadRequestError('The designated patient was not found or is invalid.');
        }
        // 2. Create the report document
        const report = new report_model_1.default({
            patientId: new mongoose_1.Types.ObjectId(patientId),
            doctorId: new mongoose_1.Types.ObjectId(doctorId),
            reportType: data.reportType,
            title: data.title,
            description: data.description,
            fileURL: data.fileURL,
            doctorNotes: data.doctorNotes,
            uploadDate: new Date(),
        });
        await report.save();
        return report;
    }
    /**
     * List medical reports filtered by requester's identity/role.
     */
    static async listReports(userId, role) {
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
            throw new errors_1.ForbiddenError('You do not have permission to view medical reports.');
        }
        return report_model_1.default.find(filter)
            .populate('patientId', 'name email role')
            .populate('doctorId', 'name email role')
            .sort({ uploadDate: -1 });
    }
    /**
     * Retrieve details of a specific medical report (with authorization check).
     */
    static async getReportById(reportId, userId, role) {
        const report = await report_model_1.default.findById(reportId)
            .populate('patientId', 'name email role')
            .populate('doctorId', 'name email role');
        if (!report) {
            throw new errors_1.NotFoundError('Medical report not found.');
        }
        // Ownership check: Patient can only view their own; Doctor can view their authored report; Admin can view all
        const isOwnerPatient = report.patientId._id.toString() === userId;
        const isAuthorDoctor = report.doctorId._id.toString() === userId;
        const isAdmin = role === 'admin';
        if (!isOwnerPatient && !isAuthorDoctor && !isAdmin) {
            throw new errors_1.ForbiddenError('Access denied. You are not authorized to view this report.');
        }
        return report;
    }
    /**
     * Delete a medical report (Only authoring doctor or admin).
     */
    static async deleteReport(reportId, userId, role) {
        const report = await report_model_1.default.findById(reportId);
        if (!report) {
            throw new errors_1.NotFoundError('Medical report not found.');
        }
        // Deletion permissions check: Authoring doctor or Admin only
        const isAuthorDoctor = report.doctorId.toString() === userId;
        const isAdmin = role === 'admin';
        if (!isAuthorDoctor && !isAdmin) {
            throw new errors_1.ForbiddenError('Access denied. Only the authoring doctor or administrator can delete this report.');
        }
        await report_model_1.default.findByIdAndDelete(reportId);
    }
}
exports.ReportService = ReportService;
exports.default = ReportService;
