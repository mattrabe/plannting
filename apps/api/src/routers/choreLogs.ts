import { router } from '../trpc'

import { createChoreLog } from '../endpoints/choreLogs/createChoreLog'
import { listChoreLogs } from '../endpoints/choreLogs/listChoreLogs'

export const choreLogsRouter = router({
  create: createChoreLog,
  list: listChoreLogs,
})

export type ChoreLogsRouter = typeof choreLogsRouter

