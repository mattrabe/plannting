import mongoose from 'mongoose'

import type { IUser } from './types'

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please fill a valid phone number'], // Phone validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum password length
  },
}, { timestamps: true })

export const User = mongoose.model<IUser>('User', userSchema)

export * from './types'
