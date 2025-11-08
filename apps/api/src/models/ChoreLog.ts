import mongoose from 'mongoose'

export interface IChoreLog {
  _id: string,
  chore: mongoose.Types.ObjectId,
  fertilizerAmount: string | null,
  notes: string | null,
  doneAt: Date,
  createdAt: Date,
  updatedAt: Date,
}

// export type DocIChoreLog = mongoose.Document & Omit<IChoreLog, '_id' | 'createdAt' | 'updatedAt'>

export const choreLogSchema = new mongoose.Schema<IChoreLog>({
  chore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chore',
    required: true,
  },
  fertilizerAmount: {
    type: String,
    required: true,
  },
  doneAt: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
  },
}, { timestamps: true })

export const ChoreLog = mongoose.model<IChoreLog>('ChoreLog', choreLogSchema)
