import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { corsOptions } from './config/cors'
import { env } from './config/env'
import routes from './routes'
import { errorHandler } from './middleware/errorHandler'
import { apiLimiter } from './middleware/rateLimiter'

const app = express()

app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json({ limit: '10kb' }))
app.use(morgan(env.isDev ? 'dev' : 'combined'))

app.use('/api', apiLimiter)
app.use('/api', routes)

app.use(errorHandler)

export default app
