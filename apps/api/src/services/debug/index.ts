import { debug as debugLibrary } from 'debug'

export {
  disable,
  enable,
  enabled,
} from 'debug'

// Create a new debugger for use anywhere
export const init = (namespace: string) => {
  const debug = debugLibrary(namespace)

  /*
  // If this is running on a remote environment, then the default stderr output will be lost. Send it to the log service.
  if (!isLocal && logService) {
    debug.log = (...args: unknown[]) => {
      const message = typeof args[0] === 'string' ? args[0] : 'message'
      const logServiceArgs = typeof args[0] === 'string' ? args.slice(1) : args

      logService.write('debug', message, ...logServiceArgs)
    }
  }
  */

  return debug
}

// Automatic endpoint debugging utilities
const ENDPOINTS_DEBUG_NAMESPACE = 'app:endpoints'
const ENDPOINTS_DEBUG_NAMESPACE_VERBOSE = 'app:endpoints:verbose'
const isVerbose = debugLibrary.enabled(ENDPOINTS_DEBUG_NAMESPACE_VERBOSE)
export const debugEndpoint = () => init(isVerbose ? ENDPOINTS_DEBUG_NAMESPACE_VERBOSE : ENDPOINTS_DEBUG_NAMESPACE) // Output non-verbose stuff on the verbose namespace is verbose is enabled
export const debugEndpointVerbose = () => init(ENDPOINTS_DEBUG_NAMESPACE_VERBOSE)
