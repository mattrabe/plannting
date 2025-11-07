
import { z } from 'zod'

import { fertilizerProcedure } from '../../procedures/fertilizerProcedure'

export const deleteFertilizer = fertilizerProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const fertilizer = await ctx.fertilizer.deleteOne({
      _id: input.id,
    })

    return fertilizer
  })
