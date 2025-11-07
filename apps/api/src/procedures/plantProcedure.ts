import { z } from 'zod'

import { Plant } from '../models'

import { publicProcedure } from './publicProcedure'
import { TRPCError } from '@trpc/server';

export const plantProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .use(async function doesExist(opts) {
    const plant = await Plant.findById(opts.input.id)

    if (!plant) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Plant not found',
      })
    }

    return opts.next({
      ctx: {
        plant,
      },
    })
  })

