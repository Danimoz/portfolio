import { connect, Connection } from 'mongoose'; // Assuming you're using mongoose

// Define the cached connection outside the function
let cachedConnection: Connection | null = null;

export default async function connectToDb() {
  try {
    // If we have a connection, return it
    if (cachedConnection) {
      return cachedConnection;
    }

    // Check if we have the MongoDB URI
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Create a new connection
    const conn = await connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      // Add these options for better reliability in serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = conn.connection;

    // Add connection error handler
    cachedConnection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      cachedConnection = null; // Reset on error
    });

    return cachedConnection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}