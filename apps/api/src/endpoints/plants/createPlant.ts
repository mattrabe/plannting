import { z } from 'zod'

import { Plant } from '../../models'

import { publicProcedure } from '../../procedures/publicProcedure'
import { convertLocalToUTC } from '../../utils/dateUtils'

export const createPlant = publicProcedure
  .input(z.object({
    name: z.string(),
    plantedAt: z.union([z.date(), z.string()]),
    notes: z.string().optional(),
    clientTimezoneOffset: z.number().optional(), // Offset in minutes from UTC
  }))
  .mutation(async ({ input }) => {
    // Convert the date from client's local timezone to UTC
    const plantedAtUTC = convertLocalToUTC(input.plantedAt, input.clientTimezoneOffset)

    const plant = await Plant.create({
      name: input.name,
      plantedAt: plantedAtUTC,
      notes: input.notes,
    })

    return plant.toObject()
  })

