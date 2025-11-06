import { performanceMiddleware } from '../middlewares/performance'
import { tRPCContext } from '../trpc'

export const publicProcedure = tRPCContext
  .procedure
  .use(performanceMiddleware)
