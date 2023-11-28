import { connect, Connection } from "mongoose";

let cachedConnection: Connection | null = null

export default async function connectToDb(){
  try {
    if (cachedConnection) return Promise.resolve(cachedConnection);
    const connection = await connect(process.env.MONGODB_URI as string, { bufferCommands: false });
    cachedConnection = connection.connection
    return cachedConnection
  } catch (error) {
    throw error;
  }
}