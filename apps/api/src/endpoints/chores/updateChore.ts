import { z } from 'zod'

import { choreProcedure } from '../../procedures/choreProcedure'
import { convertLocalToUTC } from '../../utils/dateUtils'

export const updateChore = choreProcedure
  .input(z.object({
    id: z.string(),
    fertilizer: z.string().optional(),
    fertilizerAmount: z.string().optional(),
    recurAmount: z.number().optional(),
    recurUnit: z.string().optional(),
    recurNextDate: z.union([z.date(), z.string()]).optional(),
    notes: z.string().optional(),
    clientTimezoneOffset: z.number().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, clientTimezoneOffset, recurNextDate, ...updateData } = input

    // Convert recurNextDate to UTC if provided
    if (recurNextDate !== undefined) {
      const recurNextDateUTC = recurNextDate
        ? convertLocalToUTC(recurNextDate, clientTimezoneOffset)
        : null
      ctx.chore.recurNextDate = recurNextDateUTC
    }

    // Update other fields
    if (updateData.fertilizer !== undefined) {
      ctx.chore.fertilizer = updateData.fertilizer as any
    }
    if (updateData.fertilizerAmount !== undefined) {
      ctx.chore.fertilizerAmount = updateData.fertilizerAmount ?? null
    }
    if (updateData.recurAmount !== undefined) {
      ctx.chore.recurAmount = updateData.recurAmount ?? null
    }
    if (updateData.recurUnit !== undefined) {
      ctx.chore.recurUnit = updateData.recurUnit ?? null
    }
    if (updateData.notes !== undefined) {
      ctx.chore.notes = updateData.notes ?? null
    }

    await ctx.chore.save()

    return ctx.chore.toJSON()
  })

