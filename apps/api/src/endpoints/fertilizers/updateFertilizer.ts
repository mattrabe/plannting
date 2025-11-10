
import { z } from 'zod'

import { fertilizerProcedure } from '../../procedures/fertilizerProcedure'

export const updateFertilizer = fertilizerProcedure
  .input(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['liquid', 'granules']),
    isOrganic: z.boolean(),
    notes: z.string().optional(),
    nitrogen: z.number().optional(),
    phosphorus: z.number().optional(),
    potassium: z.number().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const fertilizer = await ctx.fertilizer.updateOne({
      $set: input,
    })

    return fertilizer
  })
