import { z } from 'zod'

import { Plant } from '../../models'

import { plantProcedure } from '../../procedures/plantProcedure'

export const updatePlant = plantProcedure
  .input(z.object({
    id: z.string(),
    name: z.string(),
    plantedAt: z.date(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    ctx.plant.name = input.name
    ctx.plant.plantedAt = input.plantedAt
    ctx.plant.notes = input.notes ?? null

    await ctx.plant.save()

    return ctx.plant.toObject()
  })

