import type { Express } from 'express'
import type { Request, Response, NextFunction } from 'express-serve-static-core'

import * as debugService from '../services/debug'

  // Automatically log requests+responses when debug is enabled
export const debugEndpoints = (app: Express) => {
  const debugEndpoint = debugService.debugEndpoint()
  const debugEndpointVerbose = debugService.debugEndpointVerbose()

  // Log request
  app.use((req: Request, res: Response, next: NextFunction) => {
    debugEndpoint(`${req.method} ${req.url}`)
    Object.keys(req.body ?? {}).length > 0 && debugEndpoint(req.body)
    Object.keys(req.headers ?? {}).length > 0 && debugEndpointVerbose(req.headers)
    Object.keys(req.cookies ?? {}).length > 0 && debugEndpointVerbose(req.cookies)
    Object.keys(req.signedCookies ?? {}).length > 0 && debugEndpointVerbose(req.signedCookies)

    if (next) {
      next()
    }
  })

  // Log response
  app.use((req: Request, res: Response, next: NextFunction) => {
    const [oldWrite, oldEnd] = [res.write, res.end]
    const chunks: Buffer[] = []

    /* @ts-ignore */
    res.write = function(chunk: any) {
      chunks.push(Buffer.from(chunk));
      (oldWrite as Function).apply(res, arguments)
    }

    /* @ts-ignore */
    res.end = function(chunk: any) {
      if (chunk) {
        chunks.push(Buffer.from(chunk))
      }
      debugEndpoint(`Status: ${res.statusCode}`)

      const body = Buffer.concat(chunks).toString('utf8')
      debugEndpoint(body)

      debugEndpointVerbose(res.getHeaders());

      (oldEnd as Function).apply(res, arguments)
    }

    if (next) {
      next()
    }
  })
}
