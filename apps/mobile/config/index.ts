import type { MobileConfig } from './types'

export const config: MobileConfig = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  },
}

export * from './types'
