import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Connect to MongoDB with error handling and fallback capabilities.
 */
export async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.warn("⚠️ Warning: MONGODB_URI environment variable is not defined. Falling back to in-memory/mock state for testing.");
    return null;
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log("✅ MongoDB connected successfully!");
    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}
