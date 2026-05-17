import rateLimit from 'express-rate-limit'

const message = { message: 'Too many requests — please try again later.' }

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message,
})
