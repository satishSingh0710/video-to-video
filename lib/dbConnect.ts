import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection?.isConnected) {
    console.log("Already connected to database");
    return;
  }

  try {
    const db = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`); // Connect to MongoDB
    connection.isConnected = db.connections[0].readyState;
    console.log("Database connected");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("Database connection failed: ", error.message);
    } else {
      console.log("Database connection failed: ", error);
    }
    process.exit(1);
  }
}

export default dbConnect;
