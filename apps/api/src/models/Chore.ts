import mongoose from 'mongoose'

export interface IChore {
  _id: string,

  description: string | null,

  fertilizer: mongoose.Types.ObjectId | null,
  fertilizerAmount: string | null,

  recurAmount: number | null,
  recurUnit: string | null,

  notes: string | null,

  logs: mongoose.Types.ObjectId[],

  createdAt: Date,
  updatedAt: Date,
}

// export type DocIChore = mongoose.Document & Omit<IChore, '_id' | 'createdAt' | 'updatedAt'>

export const choreSchema = new mongoose.Schema<IChore>({
  description: {
    type: String,
    default: null,
  },
  fertilizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fertilizer',
    default: null,
  },
  fertilizerAmount: {
    type: String,
  },
  recurAmount: {
    type: Number,
  },
  recurUnit: {
    type: String,
    enum: [ 'day', 'week' ], //, 'month', 'year'],
  },
  notes: {
    type: String,
  },
  logs: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'ChoreLog',
  },
}, { timestamps: true })

export const Chore = mongoose.model<IChore>('Chore', choreSchema)
