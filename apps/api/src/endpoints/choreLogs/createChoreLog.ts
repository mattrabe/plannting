import { z } from 'zod'

import { Chore, ChoreLog, Plant } from '../../models'

import { publicProcedure } from '../../procedures/publicProcedure'
import { convertLocalToUTC } from '../../utils/dateUtils'

export const createChoreLog = publicProcedure
  .input(z.object({
    choreId: z.string(),
    fertilizerAmount: z.string().optional(),
    notes: z.string().optional(),
    doneAt: z.union([z.date(), z.string()]).optional(),
    clientTimezoneOffset: z.number().optional(),
  }))
  .mutation(async ({ input }) => {
    const { choreId, clientTimezoneOffset, doneAt, ...choreLogData } = input

    // Convert doneAt to UTC if provided, otherwise use current time
    const doneAtUTC = doneAt
      ? convertLocalToUTC(doneAt, clientTimezoneOffset)
      : new Date()

    // Create the chore log
    const choreLog = await ChoreLog.create({
      ...choreLogData,
      chore: choreId,
      fertilizerAmount: choreLogData.fertilizerAmount || null,
      doneAt: doneAtUTC,
    })

    // Add the log to the chore's logs array
    await Chore.findByIdAndUpdate(choreId, {
      $push: { logs: choreLog._id },
    })

    // Find the plant that has this chore
    const plant = await Plant.findOne({ chores: choreId })
    if (plant) {
      // The plant reference is already there, we just need to return it
    }

    return choreLog.toJSON()
  })

