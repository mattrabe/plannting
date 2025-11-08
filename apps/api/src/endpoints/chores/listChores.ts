import { z } from 'zod'

import { publicProcedure } from '../../procedures/publicProcedure'

import * as choresService from '../../services/chores'

export const listChores = publicProcedure
  .input(z.object({
    q: z.string().optional(),
  })
    .optional()
    .default({})
  )
  .query(async ({ input }) => {
    const chores = await choresService.getChores({ q: input.q })

    return { chores }
  })

