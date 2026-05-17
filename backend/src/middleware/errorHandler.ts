import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return
  }

  console.error('[error]', err.stack ?? err.message)

  res.status(500).json({
    message: env.isDev ? err.message : 'Internal server error',
  })
}
