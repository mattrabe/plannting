import { initTRPC } from '@trpc/server'
import superjson from 'superjson'

export const tRPCContext = initTRPC
  .context()
  .create({
    transformer: superjson,
  })

export const middleware = tRPCContext.middleware
export const router = tRPCContext.router
