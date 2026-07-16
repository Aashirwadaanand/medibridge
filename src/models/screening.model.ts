import { Schema, model } from 'mongoose';
import { IScreening } from '../types/screening.interface';

const screeningSchema = new Schema<IScreening>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    chwId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'CHW ID is required'],
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    screeningType: {
      type: String,
      required: [true, 'Screening type is required'],
      enum: ['Hypertension/Diabetes', 'NCD', 'Anemia', 'Tuberculosis', 'Maternal'],
      default: 'Hypertension/Diabetes',
    } as any,
    readings: {
      systolic: { type: Number },
      diastolic: { type: Number },
      bloodSugar: { type: Number },
      bloodSugarType: { type: String, enum: ['fasting', 'random'] },
      hemoglobin: { type: Number },
      tbSymptoms: { type: [String] },
      isPregnant: { type: Boolean },
      trimester: { type: Number },
      ageGroup: { type: String, enum: ['child', 'adolescent', 'adult'] },
      weight: { type: Number },
      ifaStarted: { type: Boolean },
    },
    riskClassifications: {
      hypertension: { type: String },
      diabetes: { type: String },
      anemia: { type: String },
      tb: { type: String },
      overall: {
        type: String,
        required: [true, 'Overall risk level is required'],
        enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      },
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed'],
      default: 'pending',
    },
    doctorNotes: {
      type: String,
      trim: true,
    },
    actionTaken: {
      type: String,
      trim: true,
    },
    followUpDate: {
      type: Date,
    },
    followUpStatus: {
      type: String,
      enum: ['pending', 'completed', 'none'],
      default: 'none',
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

// Indexes for fast lookup
screeningSchema.index({ patientId: 1, createdAt: -1 });
screeningSchema.index({ chwId: 1, createdAt: -1 });
screeningSchema.index({ doctorId: 1, createdAt: -1 });
screeningSchema.index({ status: 1 });

export const Screening = model<IScreening>('Screening', screeningSchema);
export default Screening;
