import Joi from '@hapi/joi';
import log from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

/*

  This code defines a schema to validate veterinarian data.

*/

const veterinarianSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
});

export const validationVeterinarian = (req: Request, res: Response, next: NextFunction) => {
  const validationResult = veterinarianSchema.validate(req.body, { abortEarly: false, convert: false });
  if (validationResult.error === undefined) {
    next();
  } else {
    const validationErrors = validationResult.error.details.map(error => {
      return { message: error.message, field: error.context?.key };
    });
    log.warn(`Veterinarian data validation failed: ${JSON.stringify(req.body)} - ${JSON.stringify(validationErrors)}`);
    res.status(400).json({ errors: validationErrors });
  }
};
