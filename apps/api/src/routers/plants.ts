import { router } from '../trpc'

import { listPlants } from '../endpoints/plants/listPlants'

export const plantsRouter = router({
  list: listPlants,
})

export type PlantsRouter = typeof plantsRouter
