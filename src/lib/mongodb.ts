import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached: {
  conn: Connection | null;
  promise: Promise<Connection> | null;
} = (global as any).mongoose || { conn: null, promise: null };

async function dbConnect(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance.connection; // ✅ only return the connection
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
