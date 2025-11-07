import { z } from 'zod'

import { plantProcedure } from '../../procedures/plantProcedure'

export const deletePlant = plantProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const plant = await ctx.plant.deleteOne({
      _id: input.id,
    })

    return plant
  })

