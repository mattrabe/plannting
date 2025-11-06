import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'

import type { TrpcRouter } from '@plannting/api/src/routers'

import { config } from '../config'

export const trpcClient = createTRPCProxyClient<TrpcRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: `${config.api.baseUrl}/trpc`,
    }),
  ],
})
