import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: "behruz-fashion-house",
    });
    console.log("MongoDB connected to database: behruz-fashion-house");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export default connectDB;
export { connectDB };
