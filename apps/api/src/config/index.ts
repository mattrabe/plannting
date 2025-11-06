import type { ApiConfig } from './types'

export const config: ApiConfig = {
  api: { port: parseInt(process.env.API_PORT || '3000') },
  mongo: {
    host: process.env.MONGO_HOST,
    appName: process.env.MONGO_APP_NAME,
    password: process.env.MONGO_PASSWORD,
    user: process.env.MONGO_USER,
    uri: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority&appName=${process.env.MONGO_APP_NAME}`,
  },
}

export * from './types'
