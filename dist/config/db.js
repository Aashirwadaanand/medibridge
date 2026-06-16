"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Connects to MongoDB Atlas using Mongoose.
 * Includes event listeners for monitoring connection state and graceful shutdown handling.
 */
const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
        console.error('CRITICAL: MONGODB_URI environment variable is not defined.');
        process.exit(1);
    }
    // Mongoose connection options
    const options = {
        autoIndex: true, // Auto-build indexes (use false in high-scale production, true for dev/ease of setup)
    };
    try {
        await mongoose_1.default.connect(mongoURI, options);
        console.log('Successfully connected to MongoDB Atlas database.');
    }
    catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
        process.exit(1);
    }
    // Connection events monitoring
    mongoose_1.default.connection.on('disconnected', () => {
        console.warn('MongoDB connection disconnected.');
    });
    mongoose_1.default.connection.on('error', (err) => {
        console.error(`MongoDB connection error: ${err}`);
    });
    // Handle application terminations gracefully
    process.on('SIGINT', async () => {
        await mongoose_1.default.connection.close();
        console.log('MongoDB connection closed due to application termination (SIGINT).');
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        await mongoose_1.default.connection.close();
        console.log('MongoDB connection closed due to application termination (SIGTERM).');
        process.exit(0);
    });
};
exports.connectDB = connectDB;
