import type mongoose from 'mongoose'

import type { IActivity } from '../Activity'

export type IPlant = {
  _id: string,
  name: string,
  plantedAt: Date,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date | null,

  activities: (mongoose.Document<unknown, any, IActivity> & IActivity)[],
}

export type DocIPlant = mongoose.Document & Omit<IPlant, '_id' | 'createdAt' | 'updatedAt'>
