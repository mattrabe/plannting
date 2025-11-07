import { router } from '../trpc'

import { createFertilizer } from '../endpoints/fertilizers/createFertilizer'
import { deleteFertilizer } from '../endpoints/fertilizers/deleteFertilizer'
import { listFertilizers } from '../endpoints/fertilizers/listFertilizers'
import { updateFertilizer } from '../endpoints/fertilizers/updateFertilizer'

export const fertilizersRouter = router({
  create: createFertilizer,
  delete: deleteFertilizer,
  list: listFertilizers,
  update: updateFertilizer,
})

export type FertilizersRouter = typeof fertilizersRouter
