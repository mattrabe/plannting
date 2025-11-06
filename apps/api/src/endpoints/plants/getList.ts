import {
  Plant,
  type IActivity,
  type IFertilizer,
} from '../../models'

import { publicProcedure } from '../../procedures/publicProcedure'

export const plantsGetList = publicProcedure.query(async () => {
  const plants = await Plant.find()
    .populate<{ activities: (IActivity & { fertilizer: IFertilizer })[] }>({
      path: 'activities',
      populate: {
        path: 'fertilizer',
      },
      select: '-plant',
    })


  const payload = { plants: plants.map(plant => plant.toObject()) }

  return payload
})
