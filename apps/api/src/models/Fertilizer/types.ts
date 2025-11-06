import type mongoose from 'mongoose'

import type { IActivity } from '../Activity'

export type IFertilizer = {
  _id: string,
  name: string,
  notes: string | null,
  nitrogen: number,
  phosphorus: number,
  potassium: number,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date | null,

  activities: (mongoose.Document<unknown, any, IActivity> & IActivity)[],
}

export type DocIFertilizer = mongoose.Document & Omit<IFertilizer, '_id' | 'createdAt' | 'updatedAt'>
