import {
  Chore,
  Plant,
  type IChore,
  type IChoreLog,
  type IFertilizer,
} from '../../models'

export const getChores = async ({
  q,
}: {
  q?: string,
} = {}) => {
    const query = q ? { $or: [ { notes: { $regex: q, $options: 'i' } }, ] } : {}

    const choresRaw = await Chore
      .find(query)
      .sort({
        recurNextDate: 1,
        createdAt: -1,
      })
      .populate<{ fertilizer: IFertilizer }>({
        path: 'fertilizer',
      })
      .populate<{ logs: IChoreLog[] }>({
        path: 'logs',
      })

    // Attach additional data
    const chores = await Promise.all(choresRaw.map(async (chore) => {
      // Get plant
      const plant = await Plant.findOne({ chores: chore._id })

      // Generate next date
      const nextDate = calculateNextDate(chore)

      return {
        ...chore.toObject(),
        nextDate,
        plant,
      }
    }))

    return chores
}

export const calculateNextDate = (chore: Pick<Omit<IChore, 'logs'> & { logs: IChoreLog[] }, 'recurAmount' | 'recurUnit' | 'logs'>) => {
  if (!chore.recurAmount || !chore.recurUnit) {
    return undefined
  }

  const lastDate = chore.logs[chore.logs.length - 1]?.doneAt

  if (!lastDate) {
    return new Date()
  }

  const nextDate = lastDate.setDate(lastDate.getDate() + (chore.recurAmount * ((chore.recurUnit === 'day' && 1) || (chore.recurUnit === 'week' && 7) || 0)))

  return nextDate
}
