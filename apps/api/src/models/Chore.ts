import mongoose from 'mongoose'

export interface IChore {
  _id: string,

  fertilizer: mongoose.Types.ObjectId,
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
    enum: [ 'day', 'week' ], //, 'month', 'year'],
  },
  logs: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'ChoreLog',
  },
}, { timestamps: true })

export const Chore = mongoose.model<IChore>('Chore', choreSchema)
