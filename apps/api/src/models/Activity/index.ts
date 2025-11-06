import mongoose from 'mongoose'

import type { IActivity } from './types'

export const activitySchema = new mongoose.Schema<IActivity>({
  notes: {
    type: String,
  },
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
  },
  fertilizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fertilizer',
  },
  fertilizerAmount: {
    type: String,
  },
  recurAmount: {
    type: Number,
  },
  recurUnit: {
    type: String,
  },
  recurNextDate: {
    type: Date,
  },
}, { timestamps: true })

export const Activity = mongoose.model<IActivity>('Activity', activitySchema)

export * from './types'
