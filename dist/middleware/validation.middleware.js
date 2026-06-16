"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateNotificationPayload = exports.validateMedicinePayload = exports.validateHospitalPayload = exports.validatePrescriptionPayload = exports.validateReportUpload = exports.validateRouteId = exports.validateAppointmentBooking = void 0;
const mongoose_1 = require("mongoose");
const errors_1 = require("../utils/errors");
/**
 * Validates request payload for booking an appointment.
 */
const validateAppointmentBooking = (req, __res, next) => {
    const { doctorId, date, time } = req.body;
    if (!doctorId) {
        throw new errors_1.BadRequestError('Doctor ID is required.');
    }
    if (!mongoose_1.Types.ObjectId.isValid(doctorId)) {
        throw new errors_1.BadRequestError('Invalid Doctor ID format. Must be a valid ObjectId.');
    }
    if (!date) {
        throw new errors_1.BadRequestError('Appointment date is required.');
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        throw new errors_1.BadRequestError('Invalid date format. Provide a ISO-8601 compatible date.');
    }
    // Ensure appointment date is in the future
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Compare date-only or exact time? Date-only starts from today.
    const appDate = new Date(parsedDate);
    appDate.setHours(0, 0, 0, 0);
    if (appDate < now) {
        throw new errors_1.BadRequestError('Appointment date cannot be in the past.');
    }
    if (!time) {
        throw new errors_1.BadRequestError('Appointment time is required.');
    }
    // Validate time format: 24h format (HH:MM) or basic duration (e.g. "10:30 AM", "14:00")
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
        throw new errors_1.BadRequestError('Invalid time format. Acceptable formats include "14:30" or "02:30 PM".');
    }
    next();
};
exports.validateAppointmentBooking = validateAppointmentBooking;
/**
 * Validates that route params (like :id) are valid MongoDB ObjectIds.
 */
const validateRouteId = (paramName = 'id') => {
    return (req, _res, next) => {
        const id = req.params[paramName];
        if (!id || !mongoose_1.Types.ObjectId.isValid(id)) {
            throw new errors_1.BadRequestError(`Invalid parameter: '${paramName}' must be a valid ObjectId.`);
        }
        next();
    };
};
exports.validateRouteId = validateRouteId;
/**
 * Validates request payload for uploading a medical report.
 */
const validateReportUpload = (req, _res, next) => {
    const { patientId, reportType, title, description, fileURL } = req.body;
    if (!patientId) {
        throw new errors_1.BadRequestError('Patient ID is required.');
    }
    if (!mongoose_1.Types.ObjectId.isValid(patientId)) {
        throw new errors_1.BadRequestError('Invalid Patient ID format. Must be a valid ObjectId.');
    }
    if (!reportType) {
        throw new errors_1.BadRequestError('Report type is required.');
    }
    const validTypes = ['Lab', 'Imaging', 'Prescription', 'General'];
    if (!validTypes.includes(reportType)) {
        throw new errors_1.BadRequestError(`Invalid report type. Supported types are: ${validTypes.join(', ')}`);
    }
    if (!title || typeof title !== 'string' || title.trim() === '') {
        throw new errors_1.BadRequestError('Report title is required and must be a valid non-empty string.');
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
        throw new errors_1.BadRequestError('Report description is required and must be a valid non-empty string.');
    }
    if (!fileURL || typeof fileURL !== 'string' || fileURL.trim() === '') {
        throw new errors_1.BadRequestError('Report file URL is required and must be a valid non-empty string.');
    }
    next();
};
exports.validateReportUpload = validateReportUpload;
/**
 * Validates request payload for creating/updating a prescription.
 */
const validatePrescriptionPayload = (req, _res, next) => {
    const { patientId, medicines, dosage, instructions } = req.body;
    // On creation, patientId is required. On updates, it is optional.
    if (req.method === 'POST') {
        if (!patientId) {
            throw new errors_1.BadRequestError('Patient ID is required.');
        }
        if (!mongoose_1.Types.ObjectId.isValid(patientId)) {
            throw new errors_1.BadRequestError('Invalid Patient ID format. Must be a valid ObjectId.');
        }
    }
    else if (req.method === 'PUT' && patientId !== undefined) {
        if (!mongoose_1.Types.ObjectId.isValid(patientId)) {
            throw new errors_1.BadRequestError('Invalid Patient ID format. Must be a valid ObjectId.');
        }
    }
    if (medicines !== undefined) {
        if (!Array.isArray(medicines) || medicines.length === 0) {
            throw new errors_1.BadRequestError('Medicines must be a non-empty array of strings.');
        }
        const hasInvalidName = medicines.some((med) => typeof med !== 'string' || med.trim() === '');
        if (hasInvalidName) {
            throw new errors_1.BadRequestError('All medicine items must be valid non-empty strings.');
        }
    }
    else if (req.method === 'POST') {
        throw new errors_1.BadRequestError('Medicines list is required.');
    }
    if (dosage !== undefined) {
        if (typeof dosage !== 'string' || dosage.trim() === '') {
            throw new errors_1.BadRequestError('Dosage must be a valid non-empty string.');
        }
    }
    else if (req.method === 'POST') {
        throw new errors_1.BadRequestError('Dosage details are required.');
    }
    if (instructions !== undefined) {
        if (typeof instructions !== 'string' || instructions.trim() === '') {
            throw new errors_1.BadRequestError('Instructions must be a valid non-empty string.');
        }
    }
    else if (req.method === 'POST') {
        throw new errors_1.BadRequestError('Usage instructions are required.');
    }
    next();
};
exports.validatePrescriptionPayload = validatePrescriptionPayload;
/**
 * Validates request payload for creating/updating a hospital record.
 */
const validateHospitalPayload = (req, _res, next) => {
    const { name, location, address, contactNumber, specialists, bedsAvailable, emergencyAvailable, rating } = req.body;
    // For POST requests, standard properties are required. For PUT, properties are checked only if provided.
    if (req.method === 'POST') {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            throw new errors_1.BadRequestError('Hospital name is required and must be a non-empty string.');
        }
        if (!location || typeof location !== 'string' || location.trim() === '') {
            throw new errors_1.BadRequestError('Hospital location is required and must be a non-empty string.');
        }
        if (!address || typeof address !== 'string' || address.trim() === '') {
            throw new errors_1.BadRequestError('Hospital address is required and must be a non-empty string.');
        }
        if (!contactNumber || typeof contactNumber !== 'string' || contactNumber.trim() === '') {
            throw new errors_1.BadRequestError('Hospital contact number is required and must be a non-empty string.');
        }
    }
    else {
        // PUT request validation checks
        if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
            throw new errors_1.BadRequestError('Hospital name must be a non-empty string.');
        }
        if (location !== undefined && (typeof location !== 'string' || location.trim() === '')) {
            throw new errors_1.BadRequestError('Hospital location must be a non-empty string.');
        }
        if (address !== undefined && (typeof address !== 'string' || address.trim() === '')) {
            throw new errors_1.BadRequestError('Hospital address must be a non-empty string.');
        }
        if (contactNumber !== undefined && (typeof contactNumber !== 'string' || contactNumber.trim() === '')) {
            throw new errors_1.BadRequestError('Hospital contact number must be a non-empty string.');
        }
    }
    // Common types checks if provided
    if (specialists !== undefined) {
        if (!Array.isArray(specialists)) {
            throw new errors_1.BadRequestError('Specialists must be an array of strings.');
        }
        const hasInvalidSpecialist = specialists.some((spec) => typeof spec !== 'string' || spec.trim() === '');
        if (hasInvalidSpecialist) {
            throw new errors_1.BadRequestError('All specialists listings must be non-empty strings.');
        }
    }
    if (bedsAvailable !== undefined) {
        if (typeof bedsAvailable !== 'number' || bedsAvailable < 0 || !Number.isInteger(bedsAvailable)) {
            throw new errors_1.BadRequestError('Beds available must be a non-negative integer.');
        }
    }
    if (emergencyAvailable !== undefined && typeof emergencyAvailable !== 'boolean') {
        throw new errors_1.BadRequestError('Emergency availability status must be a boolean.');
    }
    if (rating !== undefined) {
        if (typeof rating !== 'number' || rating < 0 || rating > 5) {
            throw new errors_1.BadRequestError('Rating must be a number between 0 and 5.');
        }
    }
    next();
};
exports.validateHospitalPayload = validateHospitalPayload;
/**
 * Validates request payload for creating/updating medicine records in inventory.
 */
const validateMedicinePayload = (req, __res, next) => {
    const { name, genericName, manufacturer, price, stock, expiryDate, category, requiresPrescription } = req.body;
    if (req.method === 'POST') {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            throw new errors_1.BadRequestError('Medicine name is required and must be a non-empty string.');
        }
        if (!genericName || typeof genericName !== 'string' || genericName.trim() === '') {
            throw new errors_1.BadRequestError('Generic chemical name is required and must be a non-empty string.');
        }
        if (!manufacturer || typeof manufacturer !== 'string' || manufacturer.trim() === '') {
            throw new errors_1.BadRequestError('Manufacturer is required and must be a non-empty string.');
        }
        if (price === undefined) {
            throw new errors_1.BadRequestError('Price is required.');
        }
        if (stock === undefined) {
            throw new errors_1.BadRequestError('Stock count is required.');
        }
        if (!expiryDate) {
            throw new errors_1.BadRequestError('Expiry date is required.');
        }
        if (!category || typeof category !== 'string' || category.trim() === '') {
            throw new errors_1.BadRequestError('Category is required and must be a non-empty string.');
        }
    }
    else {
        // PUT validations check
        if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
            throw new errors_1.BadRequestError('Medicine name must be a non-empty string.');
        }
        if (genericName !== undefined && (typeof genericName !== 'string' || genericName.trim() === '')) {
            throw new errors_1.BadRequestError('Generic chemical name must be a non-empty string.');
        }
        if (manufacturer !== undefined && (typeof manufacturer !== 'string' || manufacturer.trim() === '')) {
            throw new errors_1.BadRequestError('Manufacturer must be a non-empty string.');
        }
        if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
            throw new errors_1.BadRequestError('Category must be a non-empty string.');
        }
    }
    // Type checks
    if (price !== undefined) {
        if (typeof price !== 'number' || price < 0) {
            throw new errors_1.BadRequestError('Price must be a non-negative number.');
        }
    }
    if (stock !== undefined) {
        if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
            throw new errors_1.BadRequestError('Stock must be a non-negative integer.');
        }
    }
    if (expiryDate !== undefined) {
        const parsedDate = new Date(expiryDate);
        if (isNaN(parsedDate.getTime())) {
            throw new errors_1.BadRequestError('Invalid expiry date format.');
        }
        if (parsedDate < new Date()) {
            throw new errors_1.BadRequestError('Expiry date must be in the future.');
        }
    }
    if (requiresPrescription !== undefined && typeof requiresPrescription !== 'boolean') {
        throw new errors_1.BadRequestError('Requires prescription status must be a boolean.');
    }
    next();
};
exports.validateMedicinePayload = validateMedicinePayload;
/**
 * Validates request payload for creating/sending notification entries.
 */
const validateNotificationPayload = (req, _res, next) => {
    const { userId, title, message, type } = req.body;
    if (req.method === 'POST') {
        if (!userId) {
            throw new errors_1.BadRequestError('Recipient User ID is required.');
        }
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new errors_1.BadRequestError('Invalid Recipient User ID format. Must be a valid ObjectId.');
        }
        if (!title || typeof title !== 'string' || title.trim() === '') {
            throw new errors_1.BadRequestError('Notification title is required and must be a valid non-empty string.');
        }
        if (!message || typeof message !== 'string' || message.trim() === '') {
            throw new errors_1.BadRequestError('Notification message is required and must be a valid non-empty string.');
        }
        if (!type) {
            throw new errors_1.BadRequestError('Notification type is required.');
        }
        const validTypes = ['appointment', 'medicine', 'prescription', 'followup', 'emergency', 'general'];
        if (!validTypes.includes(type)) {
            throw new errors_1.BadRequestError(`Invalid notification type. Supported types are: ${validTypes.join(', ')}`);
        }
    }
    next();
};
exports.validateNotificationPayload = validateNotificationPayload;
