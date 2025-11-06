import mongoose from 'mongoose'

export interface IPlant {
  _id: string,
  name: string,
  activities: mongoose.Types.ObjectId[],
  plantedAt: Date,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date | null,
}

// export type DocIPlant = mongoose.Document & Omit<IPlant, '_id' | 'createdAt' | 'updatedAt'>

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
