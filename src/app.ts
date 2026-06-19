import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes/index';
import { errorMiddleware } from './middleware/error.middleware';
import { NotFoundError } from './utils/errors';

// Initialize express application
const app = express();

// Set security HTTP headers
app.use(helmet());

const corsOrigin = process.env.CORS_ORIGIN;
const allowedOrigins = corsOrigin ? corsOrigin.split(',') : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!corsOrigin || corsOrigin === '*' || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-app-mode'],
  })
);

// Development logging HTTP requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Parsing JSON body payloads
app.use(express.json({ limit: '10mb' }));

// Parsing URL-encoded body payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.get('/test-root', (_req, res) => {
  res.json({
    message: 'ROOT TEST WORKS'
  });
});

// Mount all core api routes under /api namespace
app.use('/api', apiRouter);

// Catch-all handler for 404 unmatched endpoints
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Endpoint '${req.originalUrl}' does not exist on this server.`));
});

// Centralized error interceptor middleware
app.use(errorMiddleware);

export { app };
export default app;
