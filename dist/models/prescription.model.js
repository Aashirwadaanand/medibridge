"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prescription = void 0;
const mongoose_1 = require("mongoose");
const prescriptionSchema = new mongoose_1.Schema({
    doctorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor ID is required'],
    },
    patientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required'],
    },
    medicines: {
        type: [String],
        required: [true, 'Medicines list is required'],
        validate: {
            validator: (array) => array && array.length > 0,
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
// Indexes for fast lookup of prescriptions by patient, doctor, or date
prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });
exports.Prescription = (0, mongoose_1.model)('Prescription', prescriptionSchema);
exports.default = exports.Prescription;
