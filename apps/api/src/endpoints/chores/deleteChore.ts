import { z } from 'zod'

import { Plant } from '../../models'

import { choreProcedure } from '../../procedures/choreProcedure'

export const deleteChore = choreProcedure
  .input(z.object({
    id: z.string(),
    plantId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Remove the chore from the plant's chores array
    await Plant.findByIdAndUpdate(input.plantId, {
      $pull: { chores: ctx.chore._id },
    })

    // Delete the chore
    await ctx.chore.deleteOne()

    return { success: true }
  })

