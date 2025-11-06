import { User } from '../../models/User'

import { publicProcedure } from '../../procedures/publicProcedure'

export const usersGetList = publicProcedure.query(async () => {
  const users = await User.find({}).select('-password') // Exclude password field for security

  return { users: users.map(user => user.toObject()) }
})
