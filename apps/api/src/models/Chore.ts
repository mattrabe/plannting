import mongoose from 'mongoose'

export interface IChore {
  _id: string,

  fertilizer: mongoose.Types.ObjectId,
  fertilizerAmount: string | null,

  recurAmount: number | null,
  recurUnit: string | null,
  recurNextDate: Date | null,

  notes: string | null,

  createdAt: Date,
  updatedAt: Date,
}

// export type DocIChore = mongoose.Document & Omit<IChore, '_id' | 'createdAt' | 'updatedAt'>

export const choreSchema = new mongoose.Schema<IChore>({
  notes: {
    type: String,
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

export const Chore = mongoose.model<IChore>('Chore', choreSchema)
