import mongoose from 'mongoose'

export interface IActivity {
  _id: string,

  plant: mongoose.Types.ObjectId,

  fertilizer: mongoose.Types.ObjectId,
  fertilizerAmount: string | null,

  recurAmount: number | null,
  recurUnit: string | null,
  recurNextDate: Date | null,

  notes: string | null,

  createdAt: Date,
  updatedAt: Date,
}

// export type DocIActivity = mongoose.Document & Omit<IActivity, '_id' | 'createdAt' | 'updatedAt'>

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
