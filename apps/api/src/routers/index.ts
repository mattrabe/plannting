import { router } from '../trpc'

import { healthGet } from '../endpoints/health/get'
import { statusGet } from '../endpoints/status/get'
import { usersGetList } from '../endpoints/users/getList'

// Main app router
export const trpcRouter = router({
  health: healthGet,
  status: statusGet,
  users: usersGetList,
})

export type TrpcRouter = typeof trpcRouter
