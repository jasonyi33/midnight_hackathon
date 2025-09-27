import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/errors';
import { logger } from '@utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const requestId = (req as any).requestId || uuidv4();

  if (err instanceof AppError) {
    logger.error({
      requestId,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack
    });

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.constructor.name,
        message: err.message,
        statusCode: err.statusCode,
        retryable: err.statusCode >= 500
      },
      metadata: {
        timestamp: Date.now(),
        requestId,
        version: '1.0.0'
      }
    });
  }

  logger.error({
    requestId,
    message: 'Unexpected error',
    error: err.message,
    stack: err.stack
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
      retryable: true
    },
    metadata: {
      timestamp: Date.now(),
      requestId,
      version: '1.0.0'
    }
  });
};