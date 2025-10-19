import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { DB_NAME } from "../constants.js";

export const connect_DB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log("db connection host =>", connectionInstance.connection.host);
  } catch (error) {
    console.log("db connection error =>", error);
    process.exit(1);
  }
};
