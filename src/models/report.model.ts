import { Schema, model } from 'mongoose';
import { IReport } from '../types/report.interface';

const reportSchema = new Schema<IReport>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
    },
    reportType: {
      type: String,
      enum: {
        values: ['Lab', 'Imaging', 'Prescription', 'General'],
        message: '{VALUE} is not a valid report type',
      },
      required: [true, 'Report type is required'],
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
      maxlength: [150, 'Report title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
      trim: true,
    },
    fileURL: {
      type: String,
      required: [true, 'Report file URL is required'],
      trim: true,
    },
    doctorNotes: {
      type: String,
      trim: true,
    },
    uploadDate: {
      type: Date,
      required: [true, 'Upload date is required'],
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes to speed up queries by patient and doctor
reportSchema.index({ patientId: 1, uploadDate: -1 });
reportSchema.index({ doctorId: 1, uploadDate: -1 });

export const Report = model<IReport>('Report', reportSchema);
export default Report;
