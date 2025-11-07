import { router } from '../trpc'

import { createPlant } from '../endpoints/plants/createPlant'
import { deletePlant } from '../endpoints/plants/deletePlant'
import { listPlants } from '../endpoints/plants/listPlants'
import { updatePlant } from '../endpoints/plants/updatePlant'

export const plantsRouter = router({
  create: createPlant,
  delete: deletePlant,
  list: listPlants,
  update: updatePlant,
})

export type PlantsRouter = typeof plantsRouter
