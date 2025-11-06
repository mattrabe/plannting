export type ApiConfig = {
  api: {
    port: number,
  },
  mongo: {
    host: string | undefined,
    appName: string | undefined,
    password: string | undefined,
    user: string | undefined,
    uri: string,
  },
}
