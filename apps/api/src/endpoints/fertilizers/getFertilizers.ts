import { z } from 'zod'

import { Fertilizer } from '../../models'

import { publicProcedure } from '../../procedures/publicProcedure'

export const getFertilizers = publicProcedure
  .input(z.object({
    q: z.string().optional(),
  })
    .optional()
    .default({})
  )
  .query(async ({ input }) => {
    const query = input.q ? { $or: [ { name: { $regex: input.q, $options: 'i' } }, { notes: { $regex: input.q, $options: 'i' } }, ] } : {}

    const fertilizers = await Fertilizer.find(query)

    const payload = { fertilizers: fertilizers.map(plant => plant.toObject()) }

    return payload
  })
