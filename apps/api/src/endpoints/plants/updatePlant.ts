import { z } from 'zod'

import { Plant } from '../../models'

import { plantProcedure } from '../../procedures/plantProcedure'
import { convertLocalToUTC } from '../../utils/dateUtils'

export const updatePlant = plantProcedure
  .input(z.object({
    id: z.string(),
    name: z.string(),
    plantedAt: z.union([z.date(), z.string()]).optional(),
    notes: z.string().optional(),
    clientTimezoneOffset: z.number().optional(), // Offset in minutes from UTC
  }))
  .mutation(async ({ ctx, input }) => {
    // Convert the date from client's local timezone to UTC
    const plantedAtUTC = input.plantedAt ? convertLocalToUTC(input.plantedAt, input.clientTimezoneOffset) : null

    ctx.plant.name = input.name
    ctx.plant.plantedAt = plantedAtUTC
    ctx.plant.notes = input.notes ?? null

    await ctx.plant.save()

    return ctx.plant.toJSON()
  })

