import Joi from '@hapi/joi';
import log from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

/*

  This code defines a schema to validate vaccine data.

*/

const vaccineSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  dateApplied: Joi.date().required(),
  hasExpiration: Joi.boolean().required(),
  expirationDate: Joi.date().when('hasExpiration', {
    is: true,
    then: Joi.date().greater(Joi.ref('dateApplied')).required(), // Use Joi.ref to refer to dateApplied
    otherwise: Joi.date().optional()
  }),
  nextVaccineDate: Joi.string().optional(),
  rememberNextVaccine: Joi.boolean().required(),
  trackingId: Joi.number().integer().required()
});

export const validationVaccine = (req: Request, res: Response, next: NextFunction) => {
  const { dateApplied, expirationDate } = req.body;
  const parsedDateApplied = dateApplied ? new Date(dateApplied) : undefined;
  req.body.dateApplied = parsedDateApplied; // Replace dateApplied with parsedDateApplied

  if (expirationDate !== null && expirationDate !== undefined && expirationDate !== '') {
    const parsedExpirationDate = new Date(expirationDate);
    req.body.expirationDate = parsedExpirationDate; // Replace expirationDate with parsedExpirationDate
  }

  const validationResult = vaccineSchema.validate(req.body, { abortEarly: false, convert: false });
  if (validationResult.error === undefined) {
    next();
  } else {
    const validationErrors = validationResult.error.details.map(error => {
      return { message: error.message, field: error.context?.key };
    });
    log.warn(`Vaccine data validation failed: ${JSON.stringify(req.body)} - ${JSON.stringify(validationErrors)}`);
    res.status(400).json({ errors: validationErrors });
  }
};
