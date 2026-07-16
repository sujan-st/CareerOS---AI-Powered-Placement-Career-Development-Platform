import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Atlas DB Connection Error: ${error.message}`);
    console.log(`Attempting fallback to local MongoDB...`);
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/careeros');
      console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    } catch (localError) {
      console.error(`Local MongoDB connection failed: ${localError.message}`);
      console.warn(`Attempting fallback to In-Memory MongoDB Server...`);
      try {
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
        console.log(`In-Memory MongoDB URI: ${mongoUri}`);
      } catch (memDbError) {
        console.error(`In-Memory MongoDB connection failed: ${memDbError.message}`);
        console.warn(`Proceeding with mock database connectivity rule. Server will remain online.`);
      }
    }
  }
};

export default connectDB;
