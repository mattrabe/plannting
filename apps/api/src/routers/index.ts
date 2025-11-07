import { router } from '../trpc'

import { health } from '../endpoints/health'

import { choresRouter } from './chores'
import { fertilizersRouter } from './fertilizers'
import { plantsRouter } from './plants'

// Main app router
export const trpcRouter = router({
  health,

  chores: choresRouter,
  fertilizers: fertilizersRouter,
  plants: plantsRouter,
})

export type TrpcRouter = typeof trpcRouter
