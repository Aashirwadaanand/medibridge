import dotenv from 'dotenv';

// Load environmental variables first
dotenv.config();

import app from './app';
import { connectDB } from './config/db';

// Listen to uncaught exceptions globally
process.on('uncaughtException', (err: Error) => {
  console.error('CRITICAL UNCAUGHT EXCEPTION! Shutting down server...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const startServer = async (): Promise<void> => {
  // Establish MongoDB Atlas database connection
  await connectDB();

  const port = process.env.PORT || 5000;

  const server = app.listen(port, () => {
    console.log(`===================================================`);
    console.log(`MEDIBRIDGE Server started in [${process.env.NODE_ENV}] mode.`);
    console.log(`API Local Access: http://localhost:${port}/api`);
    console.log(`Health Check API: http://localhost:${port}/api/health`);
    console.log(`===================================================`);
  });

  // Listen to unhandled promise rejections
  process.on('unhandledRejection', (err: any) => {
    console.error('CRITICAL UNHANDLED REJECTION! Shutting down server gracefully...');
    console.error(err?.name || 'Error', err?.message || err);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
