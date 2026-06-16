import Report from '../models/report.model';
import User from '../models/user.model';
import { IReport, ReportType } from '../types/report.interface';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { Types } from 'mongoose';

export class ReportService {
  /**
   * Upload/Create a new medical report (Doctors only).
   */
  public static async uploadReport(
    doctorId: string,
    patientId: string,
    data: {
      reportType: ReportType;
      title: string;
      description: string;
      fileURL: string;
      doctorNotes?: string;
    }
  ): Promise<IReport> {
    // 1. Verify patient exists and actually holds the 'patient' role
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      throw new BadRequestError('The designated patient was not found or is invalid.');
    }

    // 2. Create the report document
    const report = new Report({
      patientId: new Types.ObjectId(patientId),
      doctorId: new Types.ObjectId(doctorId),
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
  public static async listReports(userId: string, role: string): Promise<IReport[]> {
    let filter = {};

    if (role === 'patient') {
      filter = { patientId: new Types.ObjectId(userId) };
    } else if (role === 'doctor') {
      filter = { doctorId: new Types.ObjectId(userId) };
    } else if (role === 'admin') {
      filter = {};
    } else {
      throw new ForbiddenError('You do not have permission to view medical reports.');
    }

    return Report.find(filter)
      .populate('patientId', 'name email role')
      .populate('doctorId', 'name email role')
      .sort({ uploadDate: -1 });
  }

  /**
   * Retrieve details of a specific medical report (with authorization check).
   */
  public static async getReportById(reportId: string, userId: string, role: string): Promise<IReport> {
    const report = await Report.findById(reportId)
      .populate('patientId', 'name email role')
      .populate('doctorId', 'name email role');

    if (!report) {
      throw new NotFoundError('Medical report not found.');
    }

    // Ownership check: Patient can only view their own; Doctor can view their authored report; Admin can view all
    const isOwnerPatient = report.patientId._id.toString() === userId;
    const isAuthorDoctor = report.doctorId._id.toString() === userId;
    const isAdmin = role === 'admin';

    if (!isOwnerPatient && !isAuthorDoctor && !isAdmin) {
      throw new ForbiddenError('Access denied. You are not authorized to view this report.');
    }

    return report;
  }

  /**
   * Delete a medical report (Only authoring doctor or admin).
   */
  public static async deleteReport(reportId: string, userId: string, role: string): Promise<void> {
    const report = await Report.findById(reportId);

    if (!report) {
      throw new NotFoundError('Medical report not found.');
    }

    // Deletion permissions check: Authoring doctor or Admin only
    const isAuthorDoctor = report.doctorId.toString() === userId;
    const isAdmin = role === 'admin';

    if (!isAuthorDoctor && !isAdmin) {
      throw new ForbiddenError('Access denied. Only the authoring doctor or administrator can delete this report.');
    }

    await Report.findByIdAndDelete(reportId);
  }
}
export default ReportService;
