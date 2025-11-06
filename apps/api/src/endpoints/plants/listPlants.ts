import { z } from 'zod'

import {
  Plant,
  type IActivity,
  type IFertilizer,
} from '../../models'

import { publicProcedure } from '../../procedures/publicProcedure'

export const listPlants = publicProcedure
  .input(z.object({
    q: z.string().optional(),
  })
    .optional()
    .default({})
  )
  .query(async ({ input }) => {
    const query = input.q ? { $or: [ { name: { $regex: input.q, $options: 'i' } }, { notes: { $regex: input.q, $options: 'i' } }, ] } : {}

    const plants = await Plant
      .find(query)
      .populate<{ activities: (IActivity & { fertilizer: IFertilizer })[] }>({
        path: 'activities',
        populate: {
          path: 'fertilizer',
        },
        select: '-plant',
      })

    const payload = { plants: plants.map(plant => plant.toObject()) }

    return payload
  })
