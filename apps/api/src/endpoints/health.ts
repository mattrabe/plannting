import { mongo } from '../db'

import { publicProcedure } from '../procedures/publicProcedure'

export const health = publicProcedure.query(async () => {
  const mongoStatus = await mongo.rawClient
    .db()
    .command({ ping: 1 })
    .then(res => {
      if (!res.ok) {
        throw new Error('Unable to ping database.')
      }

      return {
        status: 'connected',
      }
    })
    .catch(error => {
      return {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    })

  return {
    status: 'ok',
    db: { mongo: mongoStatus },
    timestamp: new Date().toISOString(),
  }
})
