import mongoose from 'mongoose'

export interface IPlant {
  _id: string,
  name: string,
  notes: string | null,
  chores: mongoose.Types.ObjectId[],
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
  chores: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Chore',
  },
}, { timestamps: true })

export const Plant = mongoose.model<IPlant>('Plant', plantSchema)
