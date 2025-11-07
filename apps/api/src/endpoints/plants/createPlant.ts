import { z } from 'zod'

import { Plant } from '../../models'

import { publicProcedure } from '../../procedures/publicProcedure'

export const createPlant = publicProcedure
  .input(z.object({
    name: z.string(),
    plantedAt: z.date(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const plant = await Plant.create(input)

    return plant.toObject()
  })

