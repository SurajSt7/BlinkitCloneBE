import mongoose from "mongoose";

export const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log("Database connected successfully✅");
  } catch (er) {
    console.log("Database connection error: ", er);
  }
};
