"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// We will place types in a separate interface file for clarity, but also import/export them here
// to satisfy clean MVC structure. Let's design the schema:
const userSchema = new mongoose_1.Schema({
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
            values: ['patient', 'doctor', 'hospital', 'pharmacy', 'admin', 'chw'],
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
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            delete ret.password;
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        transform: (_doc, ret) => {
            delete ret.password;
            delete ret.__v;
            return ret;
        },
    },
});
// Pre-save hook: Hash user password before saving if modified
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Instance method: Verify passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    // We use this.password because it will either be present (e.g. registration/saving) 
    // or explicitly selected during login query.
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
exports.User = (0, mongoose_1.model)('User', userSchema);
exports.default = exports.User;
