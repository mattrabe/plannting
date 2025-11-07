import { z } from 'zod'

import { Chore } from '../models'

import { publicProcedure } from './publicProcedure'
import { TRPCError } from '@trpc/server';

export const choreProcedure = publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .use(async function doesExist(opts) {
    const chore = await Chore.findById(opts.input.id)

    if (!chore) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Chore not found',
      })
    }

    return opts.next({
      ctx: {
        chore,
      },
    })
  })

