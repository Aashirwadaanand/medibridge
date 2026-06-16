import { Schema, model } from 'mongoose';
import { IHospital } from '../types/hospital.interface';

const hospitalSchema = new Schema<IHospital>(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      maxlength: [150, 'Hospital name cannot exceed 150 characters'],
    },
    location: {
      type: String,
      required: [true, 'Hospital location (city/region) is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Hospital physical address is required'],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Hospital contact number is required'],
      trim: true,
    },
    specialists: {
      type: [String],
      default: [],
    },
    bedsAvailable: {
      type: Number,
      required: [true, 'Beds available count is required'],
      min: [0, 'Beds available cannot be less than zero'],
      default: 0,
    },
    emergencyAvailable: {
      type: Boolean,
      required: [true, 'Emergency availability status is required'],
      default: true,
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0.0,
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

// Indexes for speed query lookups
hospitalSchema.index({ location: 1, name: 1 });
hospitalSchema.index({ name: 'text', location: 'text' }); // Enable text searching if needed

export const Hospital = model<IHospital>('Hospital', hospitalSchema);
export default Hospital;
