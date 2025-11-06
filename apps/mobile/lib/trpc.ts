import { createTRPCReact } from '@trpc/react-query'
import type { TrpcRouter } from '@plannting/api/src/routers'

export const trpc = createTRPCReact<TrpcRouter>()
