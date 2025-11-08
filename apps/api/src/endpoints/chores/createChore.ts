import { z } from 'zod'

import { Chore, Plant } from '../../models'

import { publicProcedure } from '../../procedures/publicProcedure'

export const createChore = publicProcedure
  .input(z.object({
    plantId: z.string(),
    fertilizer: z.string(),
    fertilizerAmount: z.string().optional(),
    recurAmount: z.number().optional(),
    recurUnit: z.string().optional(),
    notes: z.string().optional(),
    clientTimezoneOffset: z.number().optional(),
 }))
  .mutation(async ({ input }) => {
    const { plantId, ...choreData } = input

    // Create the chore
    const chore = await Chore.create(choreData)

    // Add the chore to the plant's chores array
    await Plant.findByIdAndUpdate(plantId, {
      $push: { chores: chore._id },
    })

    return chore.toJSON()
  })

