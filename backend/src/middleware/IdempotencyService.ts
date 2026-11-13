import { Request, Response, NextFunction } from 'express'
import { createHash } from 'crypto'
import { AppError } from '../utils/AppError'

export const IdempotencyService = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const idempotencyKey = req.header('Idempotency-Key')

        if (!idempotencyKey) {
            throw new AppError('Missing idempotency key', 400)
        }

        if (!req.user?.userId) {
            throw new AppError('Unauthorized', 401)
        }

        const requestHash = createHash('sha256')
            .update(JSON.stringify(req.body))
            .digest('hex')

        res.locals.idempotencyKey = idempotencyKey
        res.locals.requestHash = requestHash

        next()
    } catch (error) {
        next(error)
    }
}