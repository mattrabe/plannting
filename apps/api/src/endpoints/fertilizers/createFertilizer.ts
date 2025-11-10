import { z } from 'zod'

import { Fertilizer } from '../../models'

import { publicProcedure } from '../../procedures/publicProcedure'

export const createFertilizer = publicProcedure
  .input(z.object({
    name: z.string(),
    type: z.enum(['liquid', 'granules']),
    isOrganic: z.boolean(),
    notes: z.string().optional(),
    nitrogen: z.number().optional(),
    phosphorus: z.number().optional(),
    potassium: z.number().optional(),
  }))
  .mutation(async ({ input }) => {
    const fertilizer = await Fertilizer.create(input)

    return fertilizer.toJSON()
  })
