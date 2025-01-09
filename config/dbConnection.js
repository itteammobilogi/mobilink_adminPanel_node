import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    console.log("Connecting to...", process.env.MONGODB_URL)
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};
