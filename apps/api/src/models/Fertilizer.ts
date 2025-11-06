import mongoose from 'mongoose'

export interface IFertilizer {
  _id: string,
  name: string,
  type: 'liquid' | 'granules',
  isOrganic: boolean,
  notes: string | null,
  nitrogen: number,
  phosphorus: number,
  potassium: number,
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
}, { timestamps: true })

export const Fertilizer = mongoose.model<IFertilizer>('Fertilizer', fertilizerSchema)
