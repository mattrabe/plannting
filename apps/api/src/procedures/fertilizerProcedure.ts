import { z } from 'zod'

import { Fertilizer } from '../models'

import { publicProcedure } from './publicProcedure'
import { TRPCError } from '@trpc/server';

export const fertilizerProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .use(async function doesExist(opts) {
    const fertilizer = await Fertilizer.findById(opts.input.id)

    if (!fertilizer) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Fertilizer not found',
      })
    }

    return opts.next({
      ctx: {
        fertilizer,
      },
    })
  })
