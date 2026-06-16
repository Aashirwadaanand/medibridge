"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environmental variables first
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
// Listen to uncaught exceptions globally
process.on('uncaughtException', (err) => {
    console.error('CRITICAL UNCAUGHT EXCEPTION! Shutting down server...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});
const startServer = async () => {
    // Establish MongoDB Atlas database connection
    await (0, db_1.connectDB)();
    const port = process.env.PORT || 5000;
    const server = app_1.default.listen(port, () => {
        console.log(`===================================================`);
        console.log(`MEDIBRIDGE Server started in [${process.env.NODE_ENV}] mode.`);
        console.log(`API Local Access: http://localhost:${port}/api`);
        console.log(`Health Check API: http://localhost:${port}/api/health`);
        console.log(`===================================================`);
    });
    // Listen to unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        console.error('CRITICAL UNHANDLED REJECTION! Shutting down server gracefully...');
        console.error(err?.name || 'Error', err?.message || err);
        server.close(() => {
            process.exit(1);
        });
    });
};
startServer();
