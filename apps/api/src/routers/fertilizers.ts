import { router } from '../trpc'

import { listFertilizers } from '../endpoints/fertilizers/listFertilizers'

export const fertilizersRouter = router({
  list: listFertilizers,
})

export type FertilizersRouter = typeof fertilizersRouter
