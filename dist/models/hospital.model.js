"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hospital = void 0;
const mongoose_1 = require("mongoose");
const hospitalSchema = new mongoose_1.Schema({
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
// Indexes for speed query lookups
hospitalSchema.index({ location: 1, name: 1 });
hospitalSchema.index({ name: 'text', location: 'text' }); // Enable text searching if needed
exports.Hospital = (0, mongoose_1.model)('Hospital', hospitalSchema);
exports.default = exports.Hospital;
