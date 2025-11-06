import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'

import { config } from './config'
import { mongo } from './db'
import { debugEndpoints } from './middlewares/debugEndpoints'
import { trpcRouter } from './routers'

const app = express()
const PORT = config.api.port

// Connect to MongoDB
mongo.connect()

// Middleware
app.use(cors())
app.use(express.json())

// Debug
debugEndpoints(app)

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: trpcRouter,
    createContext: () => ({}),
  })
)

// Handle inflight requests when shutting down
app.use((req, res, next) => {
  if (process.env.SHUTTING_DOWN) {
    res.setHeader('Connection', 'close')
  }

  next()
})

// Return JSON 404
app.use((req, res) => {
  res
    .status(404)
    .json({ message: 'Not Found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`)
  console.log(`📊 Health check endpoint: http://localhost:${PORT}/trpc/health`)
  console.log(`\nWaiting for requests...\n`)
})

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down API server...')

  await mongo.disconnect()
  console.log('\n✔️ MongoDB disconnected.')

//  await mongo.rawClient.close()

  console.log('\n👋 API server shut down.')

  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
