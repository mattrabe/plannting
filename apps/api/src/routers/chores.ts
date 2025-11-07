import { router } from '../trpc'

import { createChore } from '../endpoints/chores/createChore'
import { deleteChore } from '../endpoints/chores/deleteChore'
import { listChores } from '../endpoints/chores/listChores'
import { updateChore } from '../endpoints/chores/updateChore'

export const choresRouter = router({
  create: createChore,
  delete: deleteChore,
  list: listChores,
  update: updateChore,
})

export type ChoresRouter = typeof choresRouter

