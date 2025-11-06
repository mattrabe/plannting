import type mongoose from 'mongoose'

import type { IFertilizer } from '../Fertilizer'
import type { IPlant } from '../Plant'

export type IActivity = {
  _id: string,

  plant: mongoose.Document<unknown, any, IPlant> & IPlant,

  notes: string | null,

  fertilizer: mongoose.Document<unknown, any, IFertilizer> & IFertilizer,

  fertilizerAmount: string | null,

  recurAmount: number | null,
  recurUnit: string | null,
  recurNextDate: Date | null,

  createdAt: Date,
  updatedAt: Date,
}

export type DocIActivity = mongoose.Document & Omit<IActivity, '_id' | 'createdAt' | 'updatedAt'>
