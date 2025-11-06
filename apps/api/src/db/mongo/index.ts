import mongoose from 'mongoose'
import { MongoClient, ServerApiVersion } from 'mongodb'

import { config } from '../../config'

export const mongo = {
  connect: async () => {
    return await mongoose.connect(config.mongo.uri)
  },
  disconnect: async () => {
    return await mongoose.disconnect()
  },

  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  rawClient: new MongoClient(config.mongo.uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  }),
}
