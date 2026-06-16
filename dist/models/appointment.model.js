"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appointment = void 0;
const mongoose_1 = require("mongoose");
const appointmentSchema = new mongoose_1.Schema({
    patientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required'],
    },
    doctorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor ID is required'],
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required'],
    },
    time: {
        type: String,
        required: [true, 'Appointment time is required'],
        trim: true,
    },
    status: {
        type: String,
        enum: {
            values: ['Pending', 'Approved', 'Completed', 'Cancelled'],
            message: '{VALUE} is not a valid appointment status',
        },
        required: [true, 'Appointment status is required'],
        default: 'Pending',
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        transform: (_doc, ret) => {
            delete ret.__v;
            return ret;
        },
    },
});
// Indexes for fast lookup of appointments by patient, doctor, or date
appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });
exports.Appointment = (0, mongoose_1.model)('Appointment', appointmentSchema);
exports.default = exports.Appointment;
