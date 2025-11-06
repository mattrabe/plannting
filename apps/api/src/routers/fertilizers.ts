import { router } from '../trpc'

import { createFertilizer } from '../endpoints/fertilizers/createFertilizer'
import { listFertilizers } from '../endpoints/fertilizers/listFertilizers'

export const fertilizersRouter = router({
  create: createFertilizer,
  list: listFertilizers,
})

export type FertilizersRouter = typeof fertilizersRouter
