// __DEV__ is a Metro/React Native global: true in dev, false in production builds

export const logger = {
  info:  (...args: unknown[]) => { if (__DEV__) console.log('[Twinance]', ...args) },
  warn:  (...args: unknown[]) => { if (__DEV__) console.warn('[Twinance]', ...args) },
  error: (...args: unknown[]) => console.error('[Twinance]', ...args),
  req:   (method: string, path: string) => {
    if (__DEV__) console.log(`→ ${method} ${path}`)
  },
  res: (method: string, path: string, status: number) => {
    if (__DEV__) console.log(`← ${method} ${path} ${status}`)
  },
}
