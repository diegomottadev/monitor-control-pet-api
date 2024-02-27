import Joi from '@hapi/joi';
import log from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

/*

  Este código define un esquema para validar los datos de mascotas.

*/

const petSchema = Joi.object({
  name: Joi.string().required(),
  species: Joi.string().required(),
  breed: Joi.string(),
  birthdate: Joi.string().required(),
  size: Joi.string().valid('small', 'medium', 'large').required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  color: Joi.string(),
  description: Joi.string(),
  weight: Joi.number().positive(),
  isAdopted: Joi.boolean().required(),
  trackingId: Joi.any()
});

export const validationPet = (req: Request, res: Response, next: NextFunction) => {
  const validationResult = petSchema.validate(req.body, { abortEarly: false, convert: false });
  if (validationResult.error === undefined) {
    next();
  } else {
    const validationErrors = validationResult.error.details.map(error => {
      return { message: error.message, field: error.context?.key };
    });
    log.warn(`Pet data validation failed: ${JSON.stringify(req.body)} - ${JSON.stringify(validationErrors)}`);
    res.status(400).json({ errors: validationErrors });
  }
};
