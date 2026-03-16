import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.DB_URI;

    if (!mongoUri) {
      throw new Error("DB_URI is not set");
    }

    await mongoose.connect(mongoUri);
    console.log("DB is conneceted successfully");
  } catch (error) {
    console.log("DB connection failure", error);

    process.exit(1);
  }
};
