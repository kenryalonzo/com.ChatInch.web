import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error('MONGODB_URL is not defined in the environment variables');
        }
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('MongoDB connected: ${com.connection.host}');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
    
}