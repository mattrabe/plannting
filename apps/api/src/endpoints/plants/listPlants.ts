import { z } from 'zod'

import {
  Plant,
  type IChore,
  type IChoreLog,
  type IFertilizer,
} from '../../models'

import { publicProcedure } from '../../procedures/publicProcedure'

import * as choresService from '../../services/chores'

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
      .sort({
        name: 1,
        plantedAt: -1,
        createdAt: -1,
      })
      .populate<{ chores: (Omit<IChore, 'logs' | 'fertilizer'> & { fertilizer?: IFertilizer, logs: IChoreLog[] })[] }>({
        path: 'chores',
        populate: [
          { path: 'fertilizer' },
          { path: 'logs' },
        ],
        select: '-plant',
      })

    const payload = {
      plants: plants.map(plant => ({
        ...plant.toJSON(),
        chores: plant.toObject().chores.map(chore => ({
          ...chore,
          nextDate: choresService.calculateNextDate(chore),
        })),
      })),
    }

    return payload
  })
