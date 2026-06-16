"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("./routes/index"));
const error_middleware_1 = require("./middleware/error.middleware");
const errors_1 = require("./utils/errors");
// Initialize express application
const app = (0, express_1.default)();
exports.app = app;
// Set security HTTP headers
app.use((0, helmet_1.default)());
const corsOrigin = process.env.CORS_ORIGIN;
const allowedOrigins = corsOrigin ? corsOrigin.split(',') : [];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (!corsOrigin || corsOrigin === '*' || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-app-mode'],
}));
// Development logging HTTP requests
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// Parsing JSON body payloads
app.use(express_1.default.json({ limit: '10mb' }));
// Parsing URL-encoded body payloads
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Mount all core api routes under /api namespace
app.use('/api', index_1.default);
// Catch-all handler for 404 unmatched endpoints
app.use((req, _res, next) => {
    next(new errors_1.NotFoundError(`Endpoint '${req.originalUrl}' does not exist on this server.`));
});
// Centralized error interceptor middleware
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
