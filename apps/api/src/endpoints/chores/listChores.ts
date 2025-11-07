import { z } from 'zod'

import {
  Chore,
  Plant,
  type IChore,
  type IFertilizer,
} from '../../models'

import { publicProcedure } from '../../procedures/publicProcedure'

export const listChores = publicProcedure
  .input(z.object({
    q: z.string().optional(),
  })
    .optional()
    .default({})
  )
  .query(async ({ input }) => {
    const query = input.q ? { $or: [ { notes: { $regex: input.q, $options: 'i' } }, ] } : {}

    const chores = await Chore
      .find(query)
      .sort({
        recurNextDate: 1,
        createdAt: -1,
      })
      .populate<{ fertilizer: IFertilizer }>({
        path: 'fertilizer',
      })

    // Attach plants
    const choresWithPlants = await Promise.all(chores.map(async (chore) => {
      const plant = await Plant.findOne({ chores: chore._id })

      return {
        ...chore.toObject(),
        plant,
      }
    }))

    return { chores: choresWithPlants }
  })

