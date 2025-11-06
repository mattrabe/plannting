import mongoose from 'mongoose'

import type { IFertilizer } from './types'

export const fertilizerSchema = new mongoose.Schema<IFertilizer>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
  },
  nitrogen: {
    type: Number,
    required: true,
  },
  phosphorus: {
    type: Number,
    required: true,
  },
  potassium: {
    type: Number,
    required: true,
  },
  activities: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Activity',
  },
}, { timestamps: true })

export const Fertilizer = mongoose.model<IFertilizer>('Fertilizer', fertilizerSchema)

export * from './types'
