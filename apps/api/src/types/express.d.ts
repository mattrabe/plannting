import type { Request } from 'express'
import * as core from 'express-serve-static-core'

declare global {
  namespace Express {
    interface Request extends Request {}

    interface Response<ResBody = any> extends core.Response<ResBody | {
      error?: string,
    }> {}
  }
}
