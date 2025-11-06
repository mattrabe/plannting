import { router } from '../trpc'

import { health } from '../endpoints/health'
import { status } from '../endpoints/status'
import { getFertilizers } from '../endpoints/fertilizers/getFertilizers'
import { getPlants } from '../endpoints/plants/getPlants'
// import { getUsers } from '../endpoints/users/getUsers'

// Main app router
export const trpcRouter = router({
  health,
  status,

  getFertilizers,
  getPlants,
//  getUsers,
})

export type TrpcRouter = typeof trpcRouter
