import { z } from 'zod'

import { Chore, Plant } from '../../models'

import { publicProcedure } from '../../procedures/publicProcedure'
import { convertLocalToUTC } from '../../utils/dateUtils'

export const createChore = publicProcedure
  .input(z.object({
    plantId: z.string(),
    fertilizer: z.string(),
    fertilizerAmount: z.string().optional(),
    recurAmount: z.number().optional(),
    recurUnit: z.string().optional(),
    recurNextDate: z.union([z.date(), z.string()]).optional(),
    notes: z.string().optional(),
    clientTimezoneOffset: z.number().optional(),
  }))
  .mutation(async ({ input }) => {
    const { plantId, clientTimezoneOffset, recurNextDate, ...choreData } = input

    // Convert recurNextDate to UTC if provided
    const recurNextDateUTC = recurNextDate
      ? convertLocalToUTC(recurNextDate, clientTimezoneOffset)
      : null

    // Create the chore
    const chore = await Chore.create({
      ...choreData,
      recurNextDate: recurNextDateUTC,
    })

    // Add the chore to the plant's chores array
    await Plant.findByIdAndUpdate(plantId, {
      $push: { chores: chore._id },
    })

    return chore.toObject()
  })

