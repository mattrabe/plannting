import mongoose from 'mongoose'

import {
  activitySchema,
  type IActivity,
} from '../Activity'

import type { IPlant } from './types'

export const plantSchema = new mongoose.Schema<IPlant>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  plantedAt: {
    type: Date,
    required: true,
  },
  activities: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Activity',
  },
}, { timestamps: true })

export const Plant = mongoose.model<IPlant>('Plant', plantSchema)

// This is required to prevent a Mongo error, there is a probably a better way to do it that doesn't involve a duplicate export (see Activity/index.ts)
export const Activity = mongoose.model<IActivity>('Activity', activitySchema)

export * from './types'
