"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const mongoose_1 = require("mongoose");
const reportSchema = new mongoose_1.Schema({
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
// Indexes to speed up queries by patient and doctor
reportSchema.index({ patientId: 1, uploadDate: -1 });
reportSchema.index({ doctorId: 1, uploadDate: -1 });
exports.Report = (0, mongoose_1.model)('Report', reportSchema);
exports.default = exports.Report;
