import Screening from '../models/screening.model';
import User from '../models/user.model';
import NotificationService from './notification.service';
import { IScreening } from '../types/screening.interface';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { Types } from 'mongoose';
import { RiskEngine } from '../clinicalRules';

export class ScreeningService {
  /**
   * Automatically compute Hypertension, Diabetes, and Overall Risk levels.
   */
  public static computeRisk(systolic?: number, diastolic?: number, bloodSugar?: number, bloodSugarType?: 'fasting' | 'random') {
    let hypertension: 'Normal' | 'Prehypertension' | 'Stage 1' | 'Stage 2' | 'Crisis' = 'Normal';
    let diabetes: 'Normal' | 'Prediabetes' | 'Diabetes' = 'Normal';
    let overall: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';

    // 1. Hypertension classification
    if (systolic !== undefined && diastolic !== undefined) {
      if (systolic >= 180 || diastolic >= 110) {
        hypertension = 'Crisis';
      } else if ((systolic >= 160 && systolic <= 179) || (diastolic >= 100 && diastolic <= 109)) {
        hypertension = 'Stage 2';
      } else if ((systolic >= 140 && systolic <= 159) || (diastolic >= 90 && diastolic <= 99)) {
        hypertension = 'Stage 1';
      } else if ((systolic >= 120 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
        hypertension = 'Prehypertension';
      } else {
        hypertension = 'Normal';
      }
    }

    // 2. Diabetes classification
    if (bloodSugar !== undefined && bloodSugarType) {
      if (bloodSugarType === 'fasting') {
        if (bloodSugar >= 126) {
          diabetes = 'Diabetes';
        } else if (bloodSugar >= 100 && bloodSugar <= 125) {
          diabetes = 'Prediabetes';
        } else {
          diabetes = 'Normal';
        }
      } else {
        // random
        if (bloodSugar >= 200) {
          diabetes = 'Diabetes';
        } else if (bloodSugar >= 140 && bloodSugar <= 199) {
          diabetes = 'Prediabetes';
        } else {
          diabetes = 'Normal';
        }
      }
    }

    // 3. Overall Risk level estimation
    if (hypertension === 'Crisis' || (diabetes === 'Diabetes' && (hypertension === 'Stage 2' || hypertension === 'Stage 1'))) {
      overall = 'CRITICAL';
    } else if (hypertension === 'Stage 2' || diabetes === 'Diabetes') {
      overall = 'HIGH';
    } else if (hypertension === 'Stage 1' || hypertension === 'Prehypertension' || diabetes === 'Prediabetes') {
      overall = 'MODERATE';
    } else {
      overall = 'LOW';
    }

    return { hypertension, diabetes, overall };
  }

  /**
   * Record a new screening (CHWs only).
   */
  public static async createScreening(
    chwId: string,
    patientId: string,
    data: {
      screeningType: string;
      readings: {
        systolic?: number;
        diastolic?: number;
        bloodSugar?: number;
        bloodSugarType?: 'fasting' | 'random';
        hemoglobin?: number;
        tbSymptoms?: string[];
        isPregnant?: boolean;
        trimester?: number;
        ageGroup?: 'child' | 'adolescent' | 'adult';
        weight?: number;
        ifaStarted?: boolean;
      };
    }
  ): Promise<IScreening> {
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      throw new BadRequestError('The designated patient was not found.');
    }

    // Calculate risk using strategy-based RiskEngine
    const engineResult = RiskEngine.calculateRisk(data.screeningType, data.readings);

    // Create the screening document
    const screening = new Screening({
      patientId: new Types.ObjectId(patientId),
      chwId: new Types.ObjectId(chwId),
      screeningType: data.screeningType || 'Hypertension/Diabetes',
      readings: data.readings,
      riskClassifications: engineResult.riskClassifications,
      status: 'pending',
    });

    await screening.save();

    // Trigger Notification for patient and CHW
    try {
      await NotificationService.createNotification(
        patientId,
        'New Health Screening Recorded',
        `Your ${data.screeningType} screening has been uploaded. Overall Risk: ${engineResult.overall}. Awaiting Doctor review.`,
        'followup'
      );
    } catch (e) {
      console.error('Failed to dispatch notification', e);
    }

    return screening;
  }

  /**
   * List screenings based on user permissions.
   */
  public static async listScreenings(userId: string, role: string): Promise<IScreening[]> {
    let filter = {};

    if (role === 'patient') {
      filter = { patientId: new Types.ObjectId(userId) };
    } else if (role === 'chw') {
      filter = { chwId: new Types.ObjectId(userId) };
    } else if (role === 'doctor' || role === 'admin') {
      // Doctors and admins can see all screenings in queue
      filter = {};
    } else {
      throw new ForbiddenError('You are not authorized to view screening outcomes.');
    }

    return Screening.find(filter)
      .populate('patientId', 'name email role')
      .populate('chwId', 'name email role')
      .populate('doctorId', 'name email role')
      .sort({ createdAt: -1 });
  }

  /**
   * Retrieve a specific screening document.
   */
  public static async getScreeningById(screeningId: string, userId: string, role: string): Promise<IScreening> {
    const screening = await Screening.findById(screeningId)
      .populate('patientId', 'name email role')
      .populate('chwId', 'name email role')
      .populate('doctorId', 'name email role');

    if (!screening) {
      throw new NotFoundError('Screening record not found.');
    }

    // Auth validation
    const isPatient = screening.patientId.toString() === userId;
    const isChw = screening.chwId.toString() === userId;
    const isDoctor = role === 'doctor';
    const isAdmin = role === 'admin';

    if (!isPatient && !isChw && !isDoctor && !isAdmin) {
      throw new ForbiddenError('Access denied. You are not authorized to view this screening record.');
    }

    return screening;
  }

  /**
   * Doctor review action.
   */
  public static async reviewScreening(
    screeningId: string,
    doctorId: string,
    data: {
      doctorNotes: string;
      actionTaken: string;
      followUpDate?: string;
    }
  ): Promise<IScreening> {
    const screening = await Screening.findById(screeningId);
    if (!screening) {
      throw new NotFoundError('Screening record not found.');
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      throw new BadRequestError('Reviewing provider must be an approved doctor.');
    }

    screening.doctorId = new Types.ObjectId(doctorId);
    screening.doctorNotes = data.doctorNotes;
    screening.actionTaken = data.actionTaken;
    screening.status = 'reviewed';

    if (data.followUpDate) {
      screening.followUpDate = new Date(data.followUpDate);
      screening.followUpStatus = 'pending';
    } else {
      screening.followUpStatus = 'none';
    }

    await screening.save();

    // Trigger Notification for patient and CHW
    try {
      await NotificationService.createNotification(
        screening.patientId.toString(),
        'Screening Review Completed',
        `Dr. ${doctor.name} has completed their evaluation. Action: ${data.actionTaken}. Check your dashboard.`,
        'followup'
      );
      await NotificationService.createNotification(
        screening.chwId.toString(),
        'Patient Screening Reviewed',
        `Dr. ${doctor.name} reviewed the screening for patient. Follow-up: ${data.followUpDate || 'None'}.`,
        'followup'
      );
    } catch (e) {
      console.error('Failed to dispatch notifications', e);
    }

    return screening;
  }
}
export default ScreeningService;
