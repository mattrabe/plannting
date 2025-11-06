import { publicProcedure } from '../procedures/publicProcedure'

export const health = publicProcedure.query(async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  }
})
