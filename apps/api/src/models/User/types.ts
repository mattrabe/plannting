import type mongoose from 'mongoose'

export type IUser = {
  _id: string,
  name: string,
  phone: string,
  password: string,
  createdAt: Date,
  updatedAt: Date,
}

export type DocIUser = mongoose.Document & Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>
