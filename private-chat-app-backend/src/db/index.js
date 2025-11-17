import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        const finalUri = `${process.env.MONGODB_URI}/${DB_NAME}`;
        console.log("Connecting to:", finalUri);
        console.log("MONGODB_URI from .env:", process.env.MONGODB_URI);
        console.log("MongoDB connection error: ", error);
        process.exit(1);
    }
}

export default connectDB;