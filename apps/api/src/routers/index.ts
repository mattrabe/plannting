import { router } from '../trpc'

import { health } from '../endpoints/health'

import { choresRouter } from './chores'
import { choreLogsRouter } from './choreLogs'
import { fertilizersRouter } from './fertilizers'
import { plantsRouter } from './plants'

// Main app router
export const trpcRouter = router({
  health,

  chores: choresRouter,
  choreLogs: choreLogsRouter,
  fertilizers: fertilizersRouter,
  plants: plantsRouter,
})

export type TrpcRouter = typeof trpcRouter
