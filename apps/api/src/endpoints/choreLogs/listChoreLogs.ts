import { z } from 'zod'

import {
  ChoreLog,
  Plant,
  type IChore,
  type IFertilizer,
} from '../../models'

import { publicProcedure } from '../../procedures/publicProcedure'

export const listChoreLogs = publicProcedure
  .input(z.object({
    q: z.string().optional(),
  })
    .optional()
    .default({})
  )
  .query(async ({ input }) => {
    const query = input.q ? {
      $or: [
        { notes: { $regex: input.q, $options: 'i' } },
      ],
    } : {}

    const choreLogs = await ChoreLog
      .find(query)
      .sort({
        doneAt: -1,
        createdAt: -1,
      })
      .populate<{ chore: IChore & { fertilizer: IFertilizer } }>({
        path: 'chore',
        populate: {
          path: 'fertilizer',
        },
      })

    // Attach plants
    const choreLogsWithPlants = await Promise.all(choreLogs.map(async (choreLog) => {
      const plant = await Plant.findOne({ chores: (choreLog.chore as any)._id })

      return {
        ...choreLog.toJSON(),
        plant,
      }
    }))

    return { choreLogs: choreLogsWithPlants }
  })

