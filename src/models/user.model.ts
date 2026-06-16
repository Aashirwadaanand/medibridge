import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IUserMethods, UserModel } from '../types/user.interface';

// We will place types in a separate interface file for clarity, but also import/export them here
// to satisfy clean MVC structure. Let's design the schema:
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Prevents returning password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['patient', 'doctor', 'hospital', 'pharmacy', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
      default: 'patient',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
      default: 'unspecified',
    },
    dob: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    medicalHistory: {
      type: [String],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).password;
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        delete (ret as any).password;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Pre-save hook: Hash user password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method: Verify passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // We use this.password because it will either be present (e.g. registration/saving) 
  // or explicitly selected during login query.
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser, UserModel>('User', userSchema);
export default User;
