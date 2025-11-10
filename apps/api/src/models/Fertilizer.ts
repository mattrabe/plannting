import mongoose from 'mongoose'

export interface IFertilizer {
  _id: string,
  name: string,
  type: 'liquid' | 'granules',
  isOrganic: boolean,
  notes: string | null,
  nitrogen: number | null,
  phosphorus: number | null,
  potassium: number | null,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date | null,
}

// export type DocIFertilizer = mongoose.Document & Omit<IFertilizer, '_id' | 'createdAt' | 'updatedAt'>

export const fertilizerSchema = new mongoose.Schema<IFertilizer>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['liquid', 'granules'],
    required: true,
  },
  isOrganic: {
    type: Boolean,
    required: true,
  },
  notes: {
    type: String,
  },
  nitrogen: {
    type: Number,
  },
  phosphorus: {
    type: Number,
  },
  potassium: {
    type: Number,
  },
}, { timestamps: true })

export const Fertilizer = mongoose.model<IFertilizer>('Fertilizer', fertilizerSchema)
