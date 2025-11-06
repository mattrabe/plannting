import mongoose from 'mongoose'

export interface IUser {
  _id: string,
  name: string,
  phone: string,
  password: string,
  createdAt: Date,
  updatedAt: Date,
}

// export type DocIUser = mongoose.Document & Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>

export const userSchema = new mongoose.Schema<IUser>({
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
