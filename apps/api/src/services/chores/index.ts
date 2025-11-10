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
        createdAt: -1,
      })
      .populate<{ fertilizer?: IFertilizer }>({
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

    // Sort by nextDate ascending (undefined dates go to the end)
    chores.sort((a, b) => {
      if (!a.nextDate && !b.nextDate) return 0
      if (!a.nextDate) return 1
      if (!b.nextDate) return -1
      return a.nextDate.getTime() - b.nextDate.getTime()
    })

    return chores
}

export const calculateNextDate = (chore: Pick<Omit<IChore, 'logs'> & { logs: IChoreLog[] }, 'recurAmount' | 'recurUnit' | 'logs'>): Date | undefined => {
  if (!chore.recurAmount || !chore.recurUnit) {
    return undefined
  }

  const lastDate = chore.logs[chore.logs.length - 1]?.doneAt

  if (!lastDate) {
    return new Date()
  }

  const nextDate = new Date(lastDate)
  nextDate.setDate(nextDate.getDate() + (chore.recurAmount * ((chore.recurUnit === 'day' && 1) || (chore.recurUnit === 'week' && 7) || 0)))

  return nextDate
}
