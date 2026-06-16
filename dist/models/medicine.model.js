"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Medicine = void 0;
const mongoose_1 = require("mongoose");
const medicineSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Medicine name is required'],
        trim: true,
        maxlength: [100, 'Medicine name cannot exceed 100 characters'],
    },
    genericName: {
        type: String,
        required: [true, 'Generic chemical name is required'],
        trim: true,
    },
    manufacturer: {
        type: String,
        required: [true, 'Manufacturer details are required'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be less than 0'],
        default: 0.0,
    },
    stock: {
        type: Number,
        required: [true, 'Available stock count is required'],
        min: [0, 'Stock cannot be less than zero'],
        default: 0,
    },
    expiryDate: {
        type: Date,
        required: [true, 'Expiry date is required'],
    },
    pharmacyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Pharmacy owner ID is required'],
    },
    category: {
        type: String,
        required: [true, 'Category (e.g., Tablet, Syrup) is required'],
        trim: true,
    },
    requiresPrescription: {
        type: Boolean,
        required: [true, 'Prescription requirement status is required'],
        default: false,
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
medicineSchema.index({ pharmacyId: 1, name: 1 });
medicineSchema.index({ name: 'text', genericName: 'text' }); // Enable text search matches
exports.Medicine = (0, mongoose_1.model)('Medicine', medicineSchema);
exports.default = exports.Medicine;
