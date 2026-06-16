import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { BadRequestError } from '../utils/errors';

/**
 * Validates request payload for booking an appointment.
 */
export const validateAppointmentBooking = (
  req: Request,
  __res: Response,
  next: NextFunction
): void => {
  const { doctorId, date, time } = req.body;

  if (!doctorId) {
    throw new BadRequestError('Doctor ID is required.');
  }

  if (!Types.ObjectId.isValid(doctorId)) {
    throw new BadRequestError('Invalid Doctor ID format. Must be a valid ObjectId.');
  }

  if (!date) {
    throw new BadRequestError('Appointment date is required.');
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new BadRequestError('Invalid date format. Provide a ISO-8601 compatible date.');
  }

  // Ensure appointment date is in the future
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Compare date-only or exact time? Date-only starts from today.
  const appDate = new Date(parsedDate);
  appDate.setHours(0, 0, 0, 0);
  if (appDate < now) {
    throw new BadRequestError('Appointment date cannot be in the past.');
  }

  if (!time) {
    throw new BadRequestError('Appointment time is required.');
  }

  // Validate time format: 24h format (HH:MM) or basic duration (e.g. "10:30 AM", "14:00")
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    throw new BadRequestError(
      'Invalid time format. Acceptable formats include "14:30" or "02:30 PM".'
    );
  }

  next();
};

/**
 * Validates that route params (like :id) are valid MongoDB ObjectIds.
 */
export const validateRouteId = (paramName: string = 'id') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid parameter: '${paramName}' must be a valid ObjectId.`);
    }
    next();
  };
};

/**
 * Validates request payload for uploading a medical report.
 */
export const validateReportUpload = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { patientId, reportType, title, description, fileURL } = req.body;

  if (!patientId) {
    throw new BadRequestError('Patient ID is required.');
  }

  if (!Types.ObjectId.isValid(patientId)) {
    throw new BadRequestError('Invalid Patient ID format. Must be a valid ObjectId.');
  }

  if (!reportType) {
    throw new BadRequestError('Report type is required.');
  }

  const validTypes = ['Lab', 'Imaging', 'Prescription', 'General'];
  if (!validTypes.includes(reportType)) {
    throw new BadRequestError(
      `Invalid report type. Supported types are: ${validTypes.join(', ')}`
    );
  }

  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new BadRequestError('Report title is required and must be a valid non-empty string.');
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    throw new BadRequestError('Report description is required and must be a valid non-empty string.');
  }

  if (!fileURL || typeof fileURL !== 'string' || fileURL.trim() === '') {
    throw new BadRequestError('Report file URL is required and must be a valid non-empty string.');
  }

  next();
};

/**
 * Validates request payload for creating/updating a prescription.
 */
export const validatePrescriptionPayload = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { patientId, medicines, dosage, instructions } = req.body;

  // On creation, patientId is required. On updates, it is optional.
  if (req.method === 'POST') {
    if (!patientId) {
      throw new BadRequestError('Patient ID is required.');
    }
    if (!Types.ObjectId.isValid(patientId)) {
      throw new BadRequestError('Invalid Patient ID format. Must be a valid ObjectId.');
    }
  } else if (req.method === 'PUT' && patientId !== undefined) {
    if (!Types.ObjectId.isValid(patientId)) {
      throw new BadRequestError('Invalid Patient ID format. Must be a valid ObjectId.');
    }
  }

  if (medicines !== undefined) {
    if (!Array.isArray(medicines) || medicines.length === 0) {
      throw new BadRequestError('Medicines must be a non-empty array of strings.');
    }
    const hasInvalidName = medicines.some((med) => typeof med !== 'string' || med.trim() === '');
    if (hasInvalidName) {
      throw new BadRequestError('All medicine items must be valid non-empty strings.');
    }
  } else if (req.method === 'POST') {
    throw new BadRequestError('Medicines list is required.');
  }

  if (dosage !== undefined) {
    if (typeof dosage !== 'string' || dosage.trim() === '') {
      throw new BadRequestError('Dosage must be a valid non-empty string.');
    }
  } else if (req.method === 'POST') {
    throw new BadRequestError('Dosage details are required.');
  }

  if (instructions !== undefined) {
    if (typeof instructions !== 'string' || instructions.trim() === '') {
      throw new BadRequestError('Instructions must be a valid non-empty string.');
    }
  } else if (req.method === 'POST') {
    throw new BadRequestError('Usage instructions are required.');
  }

  next();
};

/**
 * Validates request payload for creating/updating a hospital record.
 */
export const validateHospitalPayload = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { name, location, address, contactNumber, specialists, bedsAvailable, emergencyAvailable, rating } = req.body;

  // For POST requests, standard properties are required. For PUT, properties are checked only if provided.
  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new BadRequestError('Hospital name is required and must be a non-empty string.');
    }
    if (!location || typeof location !== 'string' || location.trim() === '') {
      throw new BadRequestError('Hospital location is required and must be a non-empty string.');
    }
    if (!address || typeof address !== 'string' || address.trim() === '') {
      throw new BadRequestError('Hospital address is required and must be a non-empty string.');
    }
    if (!contactNumber || typeof contactNumber !== 'string' || contactNumber.trim() === '') {
      throw new BadRequestError('Hospital contact number is required and must be a non-empty string.');
    }
  } else {
    // PUT request validation checks
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      throw new BadRequestError('Hospital name must be a non-empty string.');
    }
    if (location !== undefined && (typeof location !== 'string' || location.trim() === '')) {
      throw new BadRequestError('Hospital location must be a non-empty string.');
    }
    if (address !== undefined && (typeof address !== 'string' || address.trim() === '')) {
      throw new BadRequestError('Hospital address must be a non-empty string.');
    }
    if (contactNumber !== undefined && (typeof contactNumber !== 'string' || contactNumber.trim() === '')) {
      throw new BadRequestError('Hospital contact number must be a non-empty string.');
    }
  }

  // Common types checks if provided
  if (specialists !== undefined) {
    if (!Array.isArray(specialists)) {
      throw new BadRequestError('Specialists must be an array of strings.');
    }
    const hasInvalidSpecialist = specialists.some((spec) => typeof spec !== 'string' || spec.trim() === '');
    if (hasInvalidSpecialist) {
      throw new BadRequestError('All specialists listings must be non-empty strings.');
    }
  }

  if (bedsAvailable !== undefined) {
    if (typeof bedsAvailable !== 'number' || bedsAvailable < 0 || !Number.isInteger(bedsAvailable)) {
      throw new BadRequestError('Beds available must be a non-negative integer.');
    }
  }

  if (emergencyAvailable !== undefined && typeof emergencyAvailable !== 'boolean') {
    throw new BadRequestError('Emergency availability status must be a boolean.');
  }

  if (rating !== undefined) {
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
      throw new BadRequestError('Rating must be a number between 0 and 5.');
    }
  }

  next();
};

/**
 * Validates request payload for creating/updating medicine records in inventory.
 */
export const validateMedicinePayload = (
  req: Request,
  __res: Response,
  next: NextFunction
): void => {
  const { name, genericName, manufacturer, price, stock, expiryDate, category, requiresPrescription } = req.body;

  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new BadRequestError('Medicine name is required and must be a non-empty string.');
    }
    if (!genericName || typeof genericName !== 'string' || genericName.trim() === '') {
      throw new BadRequestError('Generic chemical name is required and must be a non-empty string.');
    }
    if (!manufacturer || typeof manufacturer !== 'string' || manufacturer.trim() === '') {
      throw new BadRequestError('Manufacturer is required and must be a non-empty string.');
    }
    if (price === undefined) {
      throw new BadRequestError('Price is required.');
    }
    if (stock === undefined) {
      throw new BadRequestError('Stock count is required.');
    }
    if (!expiryDate) {
      throw new BadRequestError('Expiry date is required.');
    }
    if (!category || typeof category !== 'string' || category.trim() === '') {
      throw new BadRequestError('Category is required and must be a non-empty string.');
    }
  } else {
    // PUT validations check
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      throw new BadRequestError('Medicine name must be a non-empty string.');
    }
    if (genericName !== undefined && (typeof genericName !== 'string' || genericName.trim() === '')) {
      throw new BadRequestError('Generic chemical name must be a non-empty string.');
    }
    if (manufacturer !== undefined && (typeof manufacturer !== 'string' || manufacturer.trim() === '')) {
      throw new BadRequestError('Manufacturer must be a non-empty string.');
    }
    if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
      throw new BadRequestError('Category must be a non-empty string.');
    }
  }

  // Type checks
  if (price !== undefined) {
    if (typeof price !== 'number' || price < 0) {
      throw new BadRequestError('Price must be a non-negative number.');
    }
  }

  if (stock !== undefined) {
    if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
      throw new BadRequestError('Stock must be a non-negative integer.');
    }
  }

  if (expiryDate !== undefined) {
    const parsedDate = new Date(expiryDate);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestError('Invalid expiry date format.');
    }
    if (parsedDate < new Date()) {
      throw new BadRequestError('Expiry date must be in the future.');
    }
  }

  if (requiresPrescription !== undefined && typeof requiresPrescription !== 'boolean') {
    throw new BadRequestError('Requires prescription status must be a boolean.');
  }

  next();
};

/**
 * Validates request payload for creating/sending notification entries.
 */
export const validateNotificationPayload = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { userId, title, message, type } = req.body;

  if (req.method === 'POST') {
    if (!userId) {
      throw new BadRequestError('Recipient User ID is required.');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError('Invalid Recipient User ID format. Must be a valid ObjectId.');
    }
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new BadRequestError('Notification title is required and must be a valid non-empty string.');
    }
    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw new BadRequestError('Notification message is required and must be a valid non-empty string.');
    }
    if (!type) {
      throw new BadRequestError('Notification type is required.');
    }
    const validTypes = ['appointment', 'medicine', 'prescription', 'followup', 'emergency', 'general'];
    if (!validTypes.includes(type)) {
      throw new BadRequestError(
        `Invalid notification type. Supported types are: ${validTypes.join(', ')}`
      );
    }
  }

  next();
};





