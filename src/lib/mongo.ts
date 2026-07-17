import mongoose, { type Connection } from 'mongoose'

type ConnectionCache = {
  connection: Connection | null
  promise: Promise<Connection> | null
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseConnectionCache?: ConnectionCache
}

const cache = globalWithMongoose.mongooseConnectionCache ?? {
  connection: null,
  promise: null,
}

globalWithMongoose.mongooseConnectionCache = cache

export default async function connectToDb() {
  if (cache.connection?.readyState === 1) return cache.connection

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  cache.connection = null

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      })
      .then((mongooseInstance) => mongooseInstance.connection)
  }

  try {
    const connection = await cache.promise
    cache.connection = connection

    connection.once('disconnected', () => {
      if (cache.connection === connection) cache.connection = null
    })

    return connection
  } catch (error) {
    cache.connection = null
    console.error('Database connection error:', error)
    throw error
  } finally {
    cache.promise = null
  }
}
