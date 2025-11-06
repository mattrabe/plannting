import { publicProcedure } from '../../procedures/publicProcedure'

export const healthGet = publicProcedure.query(async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  }
})
