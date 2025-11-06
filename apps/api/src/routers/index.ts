import { router } from '../trpc'

import { health } from '../endpoints/health'

import { fertilizersRouter } from './fertilizers'
import { plantsRouter } from './plants'

// Main app router
export const trpcRouter = router({
  health,

  fertilizers: fertilizersRouter,
  plants: plantsRouter,
})

export type TrpcRouter = typeof trpcRouter
