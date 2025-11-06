import { Plant } from '../../models/Plant'

import { publicProcedure } from '../../procedures/publicProcedure'

export const plantsGetList = publicProcedure.query(async () => {
  const plants = await Plant.find().populate('activities')

  return { plants: plants.map(plant => plant.toObject()) }
})
