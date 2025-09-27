import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '@utils/errors';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => {
          return `${err.path.join('.')}: ${err.message}`;
        }).join(', ');

        return next(new ValidationError(errorMessages));
      }
      next(error);
    }
  };
};

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => {
          return `${err.path.join('.')}: ${err.message}`;
        }).join(', ');

        return next(new ValidationError(errorMessages));
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => {
          return `${err.path.join('.')}: ${err.message}`;
        }).join(', ');

        return next(new ValidationError(errorMessages));
      }
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => {
          return `${err.path.join('.')}: ${err.message}`;
        }).join(', ');

        return next(new ValidationError(errorMessages));
      }
      next(error);
    }
  };
};