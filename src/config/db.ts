import mongoose from 'mongoose';

/**
 * Connects to MongoDB Atlas using Mongoose.
 * Includes event listeners for monitoring connection state and graceful shutdown handling.
 */
export const connectDB = async (): Promise<void> => {
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
    await mongoose.connect(mongoURI, options);
    console.log('Successfully connected to MongoDB Atlas database.');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  }

  // Connection events monitoring
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB connection disconnected.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
  });

  // Handle application terminations gracefully
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to application termination (SIGINT).');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to application termination (SIGTERM).');
    process.exit(0);
  });
};
