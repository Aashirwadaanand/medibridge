import { Schema, model } from 'mongoose';
import { IPrescription } from '../types/prescription.interface';

const prescriptionSchema = new Schema<IPrescription>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    medicines: {
      type: [String],
      required: [true, 'Medicines list is required'],
      validate: {
        validator: (array: string[]) => array && array.length > 0,
        message: 'A prescription must contain at least one medicine',
      },
    },
    dosage: {
      type: String,
      required: [true, 'Dosage details are required'],
      trim: true,
    },
    instructions: {
      type: String,
      required: [true, 'Usage instructions are required'],
      trim: true,
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

// Indexes for fast lookup of prescriptions by patient, doctor, or date
prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });

export const Prescription = model<IPrescription>('Prescription', prescriptionSchema);
export default Prescription;
